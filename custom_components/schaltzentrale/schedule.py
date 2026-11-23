"""Reine Zeitplan-Logik ohne Home-Assistant-Abhängigkeit.

Ein Zeitfenster besteht aus Wochentagen (0 = Montag) und zwei Zeitpunkten
("from" und "to"). Ein Zeitpunkt ist entweder eine feste Uhrzeit oder
Sonnenaufgang/-untergang mit Versatz in Minuten. Liegt das Ende vor dem
Anfang und wird abends ein- und morgens ausgeschaltet, läuft das Fenster über
Mitternacht in den nächsten Tag. Sonst ist das Fenster an dem Tag leer.
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta, tzinfo

SunFn = Callable[[str, date], "datetime | None"]

LOOKAHEAD_DAYS = 8


def parse_hhmm(value: str) -> tuple[int, int]:
    hours, minutes = value.split(":")
    return int(hours), int(minutes)


def parse_md(value: str) -> tuple[int, int]:
    """'MM-DD' -> (Monat, Tag)."""
    month, day = value.split("-")
    return int(month), int(day)


def resolve_point(point: dict, day: date, tz: tzinfo, sun: SunFn) -> datetime | None:
    """Zeitpunkt eines Fensters an einem bestimmten Tag als datetime."""
    kind = point.get("type", "time")
    if kind == "time":
        hours, minutes = parse_hhmm(point.get("time", "00:00"))
        if hours >= 24:
            return datetime.combine(day + timedelta(days=1), time(0, 0), tzinfo=tz)
        return datetime.combine(day, time(hours, minutes), tzinfo=tz)
    event = sun(kind, day)
    if event is None:  # z. B. Polartag
        return None
    return event.astimezone(tz) + timedelta(minutes=int(point.get("offset", 0)))


def crosses_midnight(start: datetime, end: datetime) -> bool:
    """Liegt das Ende vor dem Anfang, ist das nur als Nachtfenster gewollt,
    wenn abends (ab 12 Uhr) eingeschaltet und morgens (vor 12 Uhr) ausgeschaltet wird."""
    return start.hour >= 12 and end.hour < 12


def window_intervals(
    window: dict, first: date, last: date, tz: tzinfo, sun: SunFn
) -> list[tuple[datetime, datetime]]:
    """Alle Ein-Intervalle eines Fensters, deren Starttag in [first, last] liegt."""
    out: list[tuple[datetime, datetime]] = []
    days = set(window.get("days", []))
    day = first
    while day <= last:
        if day.weekday() in days:
            start = resolve_point(window["from"], day, tz, sun)
            end = resolve_point(window["to"], day, tz, sun)
            if start is not None and end is not None and end <= start:
                if crosses_midnight(start, end):
                    end = resolve_point(window["to"], day + timedelta(days=1), tz, sun)
                else:
                    # Einschalten liegt nach Ausschalten (z. B. Aufgang 07:48
                    # bis 07:30): an diesem Tag gibt es nichts zu schalten
                    end = None
            if start is not None and end is not None and end > start:
                out.append((start, end))
        day += timedelta(days=1)
    return out


def merge(intervals: list[tuple[datetime, datetime]]) -> list[tuple[datetime, datetime]]:
    merged: list[tuple[datetime, datetime]] = []
    for start, end in sorted(intervals):
        if merged and start <= merged[-1][1]:
            if end > merged[-1][1]:
                merged[-1] = (merged[-1][0], end)
        else:
            merged.append((start, end))
    return merged


def group_intervals(
    group: dict, now: datetime, tz: tzinfo, sun: SunFn
) -> list[tuple[datetime, datetime]]:
    today = now.astimezone(tz).date()
    first = today - timedelta(days=1)
    last = today + timedelta(days=LOOKAHEAD_DAYS)
    raw: list[tuple[datetime, datetime]] = []
    for window in group.get("windows", []):
        raw.extend(window_intervals(window, first, last, tz, sun))
    return merge(raw)


@dataclass
class PlanState:
    on: bool
    next_change: datetime | None
    next_state: bool | None


def evaluate(group: dict, now: datetime, tz: tzinfo, sun: SunFn) -> PlanState:
    """Soll-Zustand einer Gruppe laut Wochenplan (ohne Thema/Saison/Pause)."""
    for start, end in group_intervals(group, now, tz, sun):
        if start <= now < end:
            return PlanState(True, end, False)
        if start > now:
            return PlanState(False, start, True)
    return PlanState(False, None, None)


def intervals_on_day(
    group: dict, day: date, tz: tzinfo, sun: SunFn
) -> list[tuple[float, float]]:
    """Ein-Zeiten eines Tages in Stunden (0-24), z. B. für die Tageskarte."""
    day_start = datetime.combine(day, time(0, 0), tzinfo=tz)
    day_end = day_start + timedelta(days=1)
    probe = day_start + timedelta(hours=12)
    out: list[tuple[float, float]] = []
    for start, end in group_intervals(group, probe, tz, sun):
        s = max(start, day_start)
        e = min(end, day_end)
        if e > s:
            out.append(
                (
                    round((s - day_start).total_seconds() / 3600, 3),
                    round((e - day_start).total_seconds() / 3600, 3),
                )
            )
    return out


def in_season(season: dict | None, day: date) -> bool:
    if not season or not season.get("enabled"):
        return True
    start = parse_md(season["start"])
    end = parse_md(season["end"])
    current = (day.month, day.day)
    if start <= end:
        return start <= current <= end
    return current >= start or current <= end

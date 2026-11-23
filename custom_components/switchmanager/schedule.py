"""Pure schedule logic without Home Assistant dependencies.

A time window has weekdays (0 = Monday) and two points in time ("from" and
"to"). A point is either a fixed time or sunrise/sunset with an offset in
minutes. If the end lies before the start and the window turns on in the
evening and off in the morning, it runs past midnight into the next day.
Otherwise the window is empty on that day.
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
    """'MM-DD' -> (month, day)."""
    month, day = value.split("-")
    return int(month), int(day)


def resolve_point(point: dict, day: date, tz: tzinfo, sun: SunFn) -> datetime | None:
    """A window's point in time on a given day as datetime."""
    kind = point.get("type", "time")
    if kind == "time":
        hours, minutes = parse_hhmm(point.get("time", "00:00"))
        if hours >= 24:
            return datetime.combine(day + timedelta(days=1), time(0, 0), tzinfo=tz)
        return datetime.combine(day, time(hours, minutes), tzinfo=tz)
    event = sun(kind, day)
    if event is None:  # e.g. polar day
        return None
    return event.astimezone(tz) + timedelta(minutes=int(point.get("offset", 0)))


def crosses_midnight(start: datetime, end: datetime) -> bool:
    """An end before the start only means an overnight window when it turns
    on in the evening (from 12:00) and off in the morning (before 12:00)."""
    return start.hour >= 12 and end.hour < 12


def window_intervals(
    window: dict, first: date, last: date, tz: tzinfo, sun: SunFn
) -> list[tuple[datetime, datetime]]:
    """All on-intervals of a window whose start day lies in [first, last]."""
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
                    # On is after off (e.g. sunrise 07:48 to 07:30):
                    # nothing to switch on that day
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
    """Desired state of a group by its weekly plan (ignoring theme/season/pause)."""
    for start, end in group_intervals(group, now, tz, sun):
        if start <= now < end:
            return PlanState(True, end, False)
        if start > now:
            return PlanState(False, start, True)
    return PlanState(False, None, None)


def intervals_on_day(
    group: dict, day: date, tz: tzinfo, sun: SunFn
) -> list[tuple[float, float]]:
    """On-times of one day in hours (0-24), e.g. for the today card."""
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

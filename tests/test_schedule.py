"""Tests of the plain schedule logic (no Home Assistant needed)."""

import importlib.util
import sys
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

import pytest
import voluptuous as vol

BASE = Path(__file__).parents[1] / "custom_components" / "switchmanager"


def _load(name):
    spec = importlib.util.spec_from_file_location(f"sz_{name}", BASE / f"{name}.py")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


schedule = _load("schedule")
models = _load("models")

TZ = ZoneInfo("Europe/Berlin")


def sun(kind, day):
    # Fixed: sunrise 07:48, sunset 16:28
    hour, minute = (7, 48) if kind == "sunrise" else (16, 28)
    return datetime(day.year, day.month, day.day, hour, minute, tzinfo=TZ)


def at(y, m, d, hh, mm=0):
    return datetime(y, m, d, hh, mm, tzinfo=TZ)


def t(hhmm):
    return {"type": "time", "time": hhmm}


# 23 Nov 2026 is a Monday
MONDAY = (2026, 11, 23)


def test_simple_window_on_and_off():
    group = {"windows": [{"days": [0], "from": t("15:00"), "to": t("22:30")}]}
    on = schedule.evaluate(group, at(*MONDAY, 17), TZ, sun)
    assert on.on and on.next_change == at(*MONDAY, 22, 30) and on.next_state is False
    off = schedule.evaluate(group, at(*MONDAY, 10), TZ, sun)
    assert not off.on and off.next_change == at(*MONDAY, 15)


def test_weekday_filter_finds_next_week():
    group = {"windows": [{"days": [5], "from": t("08:00"), "to": t("09:00")}]}
    res = schedule.evaluate(group, at(*MONDAY, 12), TZ, sun)
    assert not res.on and res.next_change == at(2026, 11, 28, 8)


def test_sun_with_offset():
    group = {"windows": [{"days": list(range(7)), "from": {"type": "sunset", "offset": -15}, "to": t("23:00")}]}
    assert not schedule.evaluate(group, at(*MONDAY, 16, 0), TZ, sun).on
    res = schedule.evaluate(group, at(*MONDAY, 16, 20), TZ, sun)
    assert res.on and res.next_change == at(*MONDAY, 23)


def test_morning_until_sunrise():
    group = {"windows": [{"days": [0], "from": t("04:55"), "to": {"type": "sunrise", "offset": 15}}]}
    res = schedule.evaluate(group, at(*MONDAY, 6), TZ, sun)
    assert res.on and res.next_change == at(*MONDAY, 8, 3)


def test_window_over_midnight():
    group = {"windows": [{"days": [0], "from": t("22:00"), "to": t("02:00")}]}
    assert schedule.evaluate(group, at(*MONDAY, 23), TZ, sun).on
    tuesday_night = schedule.evaluate(group, at(2026, 11, 24, 1), TZ, sun)
    assert tuesday_night.on and tuesday_night.next_change == at(2026, 11, 24, 2)
    assert not schedule.evaluate(group, at(2026, 11, 24, 23), TZ, sun).on


def test_overlapping_windows_are_merged():
    group = {"windows": [
        {"days": [0], "from": t("15:00"), "to": t("18:00")},
        {"days": [0], "from": t("17:00"), "to": t("20:00")},
    ]}
    res = schedule.evaluate(group, at(*MONDAY, 16), TZ, sun)
    assert res.on and res.next_change == at(*MONDAY, 20)


def test_until_midnight_24_00():
    group = {"windows": [{"days": [0], "from": t("20:00"), "to": t("24:00")}]}
    res = schedule.evaluate(group, at(*MONDAY, 23, 59), TZ, sun)
    assert res.on and res.next_change == at(2026, 11, 24, 0)


def test_no_windows():
    res = schedule.evaluate({"windows": []}, at(*MONDAY, 12), TZ, sun)
    assert not res.on and res.next_change is None


def test_intervals_on_day_clips_midnight():
    group = {"windows": [{"days": [6], "from": t("22:00"), "to": t("02:00")}]}
    # Sunday 22 Nov -> Monday 0-2 h
    assert schedule.intervals_on_day(group, date(*MONDAY), TZ, sun) == [(0.0, 2.0)]


@pytest.mark.parametrize(
    ("day", "expected"),
    [(date(2026, 11, 28), False), (date(2026, 11, 29), True), (date(2026, 12, 31), True),
     (date(2027, 1, 6), True), (date(2027, 1, 7), False)],
)
def test_season_over_new_year(day, expected):
    season = {"enabled": True, "start": "11-29", "end": "01-06"}
    assert schedule.in_season(season, day) is expected


def test_season_disabled_is_always_on():
    assert schedule.in_season({"enabled": False, "start": "05-01", "end": "05-02"}, date(2026, 1, 1))


def test_config_schema_defaults_and_validation():
    cfg = models.CONFIG_SCHEMA({"themes": [{"id": "outdoor", "name": "Outdoor", "groups": [
        {"id": "windows", "name": "Windows", "entities": ["switch.tasmota_7"],
         "windows": [{"days": [3, 1, 1], "from": {"type": "sunset"}, "to": t("23:00")}]}]}]})
    theme = cfg["themes"][0]
    assert cfg["paused"] is False and theme["active"] is True and theme["season"]["enabled"] is False
    assert theme["groups"][0]["windows"][0]["days"] == [1, 3]
    assert theme["groups"][0]["windows"][0]["from"]["offset"] == 0
    with pytest.raises(vol.Invalid):
        models.CONFIG_SCHEMA({"themes": [{"id": "a", "name": "A", "groups": [{"id": "a", "name": "B"}]}]})
    with pytest.raises(vol.Invalid):
        models.CONFIG_SCHEMA({"themes": [{"id": "a", "name": "A", "groups": [
            {"id": "g", "name": "G", "windows": [{"days": [0], "from": t("25:00"), "to": t("23:00")}]}]}]})


def test_structure_key_ignores_schedule_changes():
    base = {"themes": [{"id": "a", "name": "A", "groups": [{"id": "g", "name": "G", "windows": []}]}]}
    cfg1 = models.CONFIG_SCHEMA(base)
    base["themes"][0]["groups"][0]["windows"] = [{"days": [0], "from": t("01:00"), "to": t("02:00")}]
    cfg2 = models.CONFIG_SCHEMA(base)
    assert models.structure_key(cfg1) == models.structure_key(cfg2)
    base["themes"][0]["name"] = "B"
    assert models.structure_key(models.CONFIG_SCHEMA(base)) != models.structure_key(cfg1)


def test_start_after_end_same_morning_is_empty_not_24h():
    # Sunrise (07:48) until 07:30: no window, instead of on until the next day
    group = {"windows": [{"days": [0], "from": {"type": "sunrise"}, "to": t("07:30")}]}
    assert not schedule.evaluate(group, at(*MONDAY, 9), TZ, sun).on
    assert schedule.intervals_on_day(group, date(*MONDAY), TZ, sun) == []
    assert schedule.intervals_on_day(group, date(2026, 11, 24), TZ, sun) == []


def test_start_after_end_in_evening_is_empty():
    group = {"windows": [{"days": [0], "from": t("21:00"), "to": t("20:00")}]}
    assert not schedule.evaluate(group, at(*MONDAY, 22), TZ, sun).on

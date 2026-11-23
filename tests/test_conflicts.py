"""Tests of the conflict check parsing (no Home Assistant needed)."""

from datetime import date, datetime
from zoneinfo import ZoneInfo

from custom_components.switchmanager import conflicts


TZ = ZoneInfo("Europe/Berlin")
MONDAY = date(2026, 11, 23)


def sun(kind, day):
    hour, minute = (7, 48) if kind == "sunrise" else (16, 28)
    return datetime(day.year, day.month, day.day, hour, minute, tzinfo=TZ)


def no_scenes(_scene):
    return {}


def test_effects_walks_nested_actions_and_scenes():
    config = {"actions": [
        {"choose": [{"conditions": [], "sequence": [
            {"service": "switch.turn_off", "entity_id": "switch.a, switch.b"}]}]},
        {"if": [], "then": [{"action": "light.toggle", "target": {"entity_id": ["light.c"]}}]},
        {"scene": "scene.xmas"},
        {"action": "automation.turn_off", "target": {"entity_id": "automation.x"}},
        {"action": "notify.mobile", "data": {"message": "hi"}},
    ]}
    scenes = {"scene.xmas": {"switch.d": "on", "switch.e": "off", "sensor.f": "12"}}
    got = sorted(conflicts.effects(config, lambda s: scenes.get(s, {})))
    assert got == [("light.c", "toggle"), ("switch.a", "off"), ("switch.b", "off"),
                   ("switch.d", "on"), ("switch.e", "off")]


def test_triggers_time_sun_weekday_and_input_datetime():
    config = {
        "trigger": [
            {"platform": "time", "at": ["04:55:00", "input_datetime.wake"]},
            {"platform": "sun", "event": "sunset", "offset": "-00:15:00"},
            {"platform": "state", "entity_id": "binary_sensor.x"},
        ],
        "condition": [{"condition": "time", "weekday": ["mon", "fri"]}],
    }
    trig = conflicts.triggers(config, lambda e: "06:30:00" if e == "input_datetime.wake" else None)
    assert trig[0] == {"kind": "time", "hour": round(4 + 55 / 60, 4), "days": [0, 4], "label": "04:55"}
    assert trig[1]["hour"] == 6.5 and trig[1]["label"] == "06:30"
    assert trig[2]["kind"] == "sun" and trig[2]["offset"] == -15 and trig[2]["days"] == [0, 4]
    assert trig[3]["kind"] == "other" and trig[3]["label"] == "state"


def test_check_group_levels():
    group = {"entities": ["switch.a"], "windows": [
        {"days": [0, 1, 2, 3, 4, 5, 6], "from": {"type": "sunset", "offset": 0}, "to": {"type": "time", "time": "23:00"}}]}
    autos = [
        {"entity_id": "automation.off", "name": "Off at 20", "enabled": True, "edit_id": "1",
         "effects": [("switch.a", "off")], "triggers": [{"kind": "time", "hour": 20.0, "days": [5, 6], "label": "20:00"}]},
        {"entity_id": "automation.on", "name": "On at sunset", "enabled": True, "edit_id": "2",
         "effects": [("switch.a", "on")], "triggers": [{"kind": "sun", "event": "sunset", "offset": 0, "days": [0], "label": "sunset"}]},
        {"entity_id": "automation.morning", "name": "On at 5", "enabled": True, "edit_id": "3",
         "effects": [("switch.a", "on")], "triggers": [{"kind": "time", "hour": 5.0, "days": [0], "label": "05:00"}]},
        {"entity_id": "automation.old", "name": "Old", "enabled": False, "edit_id": "4",
         "effects": [("switch.a", "on")], "triggers": []},
        {"entity_id": "automation.other", "name": "Other", "enabled": True, "edit_id": "5",
         "effects": [("switch.z", "on")], "triggers": []},
    ]
    found = conflicts.check_group(group, autos, MONDAY, TZ, sun)
    by_name = {f["automation"]["name"]: f for f in found}
    assert by_name["Off at 20"]["code"] == "turns_off_against_plan" and by_name["Off at 20"]["days"] == [5, 6]
    assert by_name["On at sunset"]["code"] == "duplicate"
    assert by_name["On at 5"]["code"] == "turns_on_against_plan"
    assert by_name["Old"]["code"] == "disabled" and by_name["Old"]["level"] == "info"
    assert "Other" not in by_name
    assert [f["level"] for f in found] == ["conflict", "conflict", "duplicate", "info"]

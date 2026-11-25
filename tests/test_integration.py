"""End-to-end tests with a real (test) Home Assistant."""

from datetime import datetime, timedelta
from unittest.mock import AsyncMock, patch
from zoneinfo import ZoneInfo

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_time_changed

import custom_components.switchplan  # noqa: E402,F401

TZ = ZoneInfo("Europe/Berlin")
START = datetime(2026, 11, 23, 14, 0, tzinfo=TZ)  # Monday


def cfg(windows, active=True, season=None):
    return {
        "paused": False,
        "sync_on_start": True,
        "themes": [{
            "id": "outdoor", "name": "Christmas outdoor", "color": "#f59e0b", "active": active,
            "season": season or {"enabled": False, "start": "11-29", "end": "01-06"},
            "groups": [{"id": "windows", "name": "Windows", "entities": ["input_boolean.lamp", "input_boolean.gone"],
                        "windows": windows}],
        }],
    }


WIN = [{"days": [0, 1, 2, 3, 4, 5, 6], "from": {"type": "time", "time": "15:00"}, "to": {"type": "time", "time": "16:00"}}]


@pytest.fixture
async def setup(hass: HomeAssistant, freezer, hass_ws_client):
    await hass.config.async_set_time_zone("Europe/Berlin")
    assert await async_setup_component(hass, "http", {})
    client = await hass_ws_client(hass)  # log in before the time jump
    freezer.move_to(START)
    assert await async_setup_component(hass, "homeassistant", {})
    assert await async_setup_component(hass, "input_boolean", {"input_boolean": {"lamp": {}}})
    # There is no frontend in tests; mark it as loaded
    for dep in ("frontend", "panel_custom"):
        hass.config.components.add(dep)
    entry = MockConfigEntry(domain="switchplan", title="SwitchPlan")
    entry.add_to_hass(hass)
    with patch("custom_components.switchplan.panel_custom.async_register_panel") as reg, \
         patch("custom_components.switchplan.frontend.add_extra_js_url"), \
         patch("custom_components.switchplan.frontend.async_remove_panel"), \
         patch.object(hass.http, "async_register_static_paths", AsyncMock()):
        assert await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()
        assert reg.called
    return entry, client


async def _save(client, config):
    await client.send_json_auto_id({"type": "switchplan/save", "config": config})
    res = await client.receive_json()
    assert res["success"], res
    return res["result"]


async def _tick(hass, freezer, when):
    freezer.move_to(when)
    async_fire_time_changed(hass, when)
    await hass.async_block_till_done()


async def test_get_empty(hass, setup):
    _entry, client = setup
    await client.send_json_auto_id({"type": "switchplan/get"})
    res = await client.receive_json()
    assert res["success"] and res["result"]["config"]["themes"] == []


async def test_schedule_switches_on_and_off(hass, setup, freezer):
    _entry, client = setup
    result = await _save(client, cfg(WIN))
    await hass.async_block_till_done()
    assert result["status"]["groups"]["windows"]["on"] is False
    assert hass.states.get("input_boolean.lamp").state == "off"
    # Structure changed -> reload creates entities
    assert hass.states.get("switch.switchplan_christmas_outdoor") is not None
    assert hass.states.get("binary_sensor.switchplan_christmas_outdoor_windows").state == "off"

    await _tick(hass, freezer, START.replace(hour=15, second=1))
    assert hass.states.get("input_boolean.lamp").state == "on"
    assert hass.states.get("binary_sensor.switchplan_christmas_outdoor_windows").state == "on"

    await _tick(hass, freezer, START.replace(hour=16, second=1))
    assert hass.states.get("input_boolean.lamp").state == "off"


async def test_theme_switch_off_turns_devices_off(hass, setup, freezer):
    _entry, client = setup
    await _save(client, cfg(WIN))
    await hass.async_block_till_done()
    await _tick(hass, freezer, START.replace(hour=15, minute=10))
    assert hass.states.get("input_boolean.lamp").state == "on"

    await hass.services.async_call("switch", "turn_off", {"entity_id": "switch.switchplan_christmas_outdoor"}, blocking=True)
    await hass.async_block_till_done()
    assert hass.states.get("input_boolean.lamp").state == "off"
    assert hass.states.get("binary_sensor.switchplan_christmas_outdoor_windows").attributes["reason"] == "theme_off"


async def test_pause_freezes_and_resume_syncs(hass, setup, freezer):
    _entry, client = setup
    await _save(client, cfg(WIN))
    await hass.async_block_till_done()
    await hass.services.async_call("switch", "turn_on", {"entity_id": "switch.switchplan_pause"}, blocking=True)
    await _tick(hass, freezer, START.replace(hour=15, minute=5))
    assert hass.states.get("input_boolean.lamp").state == "off"  # paused: nothing happens
    await hass.services.async_call("switch", "turn_off", {"entity_id": "switch.switchplan_pause"}, blocking=True)
    await hass.async_block_till_done()
    assert hass.states.get("input_boolean.lamp").state == "on"  # after pause back to the plan


async def test_out_of_season_does_nothing(hass, setup, freezer):
    _entry, client = setup
    await _save(client, cfg(WIN, season={"enabled": True, "start": "11-29", "end": "01-06"}))
    await hass.async_block_till_done()
    await _tick(hass, freezer, START.replace(hour=15, minute=5))
    assert hass.states.get("input_boolean.lamp").state == "off"


async def test_invalid_config_rejected(hass, setup):
    _entry, client = setup
    bad = cfg([{"days": [0], "from": {"type": "time", "time": "99:00"}, "to": {"type": "time", "time": "10:00"}}])
    await client.send_json_auto_id({"type": "switchplan/save", "config": bad})
    res = await client.receive_json()
    assert not res["success"] and res["error"]["code"] == "invalid_format"


async def test_removed_group_entity_cleaned_up(hass, setup):
    _entry, client = setup
    await _save(client, cfg(WIN))
    await hass.async_block_till_done()
    empty = cfg(WIN)
    empty["themes"][0]["groups"] = []
    await _save(client, empty)
    await hass.async_block_till_done()
    assert hass.states.get("binary_sensor.switchplan_christmas_outdoor_windows") is None


@pytest.mark.parametrize("old_key", ["switchmanager", "schaltzentrale"])
async def test_imports_config_of_earlier_names(hass, hass_storage, freezer, hass_ws_client, old_key):
    hass_storage[old_key] = {"version": 1, "minor_version": 1, "key": old_key, "data": cfg(WIN)}
    await hass.config.async_set_time_zone("Europe/Berlin")
    assert await async_setup_component(hass, "http", {})
    client = await hass_ws_client(hass)
    for dep in ("frontend", "panel_custom"):
        hass.config.components.add(dep)
    entry = MockConfigEntry(domain="switchplan", title="SwitchPlan")
    entry.add_to_hass(hass)
    with patch("custom_components.switchplan.panel_custom.async_register_panel"), \
         patch("custom_components.switchplan.frontend.add_extra_js_url"), \
         patch.object(hass.http, "async_register_static_paths", AsyncMock()):
        assert await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()
    await client.send_json_auto_id({"type": "switchplan/get"})
    res = await client.receive_json()
    assert res["result"]["config"]["themes"][0]["name"] == "Christmas outdoor"


async def test_conflict_check_finds_other_automations(hass, setup):
    _entry, client = setup
    window = [{"days": [0, 1, 2, 3, 4, 5, 6], "from": {"type": "time", "time": "15:00"}, "to": {"type": "time", "time": "22:00"}}]
    await _save(client, cfg(window))
    await hass.async_block_till_done()
    assert await async_setup_component(hass, "scene", {"scene": [
        {"name": "Lamp on", "entities": {"input_boolean.lamp": "on"}}]})
    assert await async_setup_component(hass, "automation", {"automation": [
        {"id": "a1", "alias": "Lamp off at 18", "triggers": [{"trigger": "time", "at": "18:00:00"}],
         "actions": [{"action": "input_boolean.turn_off", "target": {"entity_id": "input_boolean.lamp"}}]},
        {"id": "a2", "alias": "Old Christmas on", "triggers": [{"trigger": "time", "at": "15:00:00"}],
         "actions": [{"action": "scene.turn_on", "target": {"entity_id": "scene.lamp_on"}}]},
        {"id": "a3", "alias": "Motion", "triggers": [{"trigger": "state", "entity_id": "input_boolean.gone"}],
         "actions": [{"action": "homeassistant.toggle", "entity_id": "input_boolean.lamp"}]},
        {"id": "a4", "alias": "Unrelated", "triggers": [{"trigger": "time", "at": "10:00:00"}],
         "actions": [{"action": "input_boolean.turn_on", "target": {"entity_id": "input_boolean.other"}}]},
    ]})
    await hass.async_block_till_done()
    await client.send_json_auto_id({"type": "switchplan/check"})
    res = await client.receive_json()
    assert res["success"], res
    findings = res["result"]["groups"]["windows"]
    codes = {(f["automation"]["name"] if f["automation"] else None, f["code"]) for f in findings}
    assert ("Lamp off at 18", "turns_off_against_plan") in codes
    assert ("Old Christmas on", "duplicate") in codes
    assert ("Motion", "toggle") in codes
    assert (None, "unavailable") in codes  # input_boolean.gone does not exist
    assert not any(name == "Unrelated" for name, _ in codes)
    conflict = next(f for f in findings if f["code"] == "turns_off_against_plan")
    assert conflict["level"] == "conflict" and conflict["hour"] == 18 and conflict["automation"]["edit_id"] == "a1"

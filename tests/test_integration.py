"""Ende-zu-Ende-Tests mit einem echten (Test-)Home-Assistant."""

from datetime import datetime, timedelta
from unittest.mock import AsyncMock, patch
from zoneinfo import ZoneInfo

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_fire_time_changed

import custom_components.schaltzentrale  # noqa: E402,F401

TZ = ZoneInfo("Europe/Berlin")
START = datetime(2026, 11, 23, 14, 0, tzinfo=TZ)  # Montag


def cfg(windows, active=True, season=None):
    return {
        "paused": False,
        "sync_on_start": True,
        "themes": [{
            "id": "aussen", "name": "Weihnachten Außen", "color": "#f59e0b", "active": active,
            "season": season or {"enabled": False, "start": "11-29", "end": "01-06"},
            "groups": [{"id": "fenster", "name": "Fenster", "entities": ["input_boolean.lampe", "input_boolean.weg"],
                        "windows": windows}],
        }],
    }


WIN = [{"days": [0, 1, 2, 3, 4, 5, 6], "from": {"type": "time", "time": "15:00"}, "to": {"type": "time", "time": "16:00"}}]


@pytest.fixture
async def setup(hass: HomeAssistant, freezer, hass_ws_client):
    await hass.config.async_set_time_zone("Europe/Berlin")
    assert await async_setup_component(hass, "http", {})
    client = await hass_ws_client(hass)  # vor dem Zeitsprung anmelden
    freezer.move_to(START)
    assert await async_setup_component(hass, "homeassistant", {})
    assert await async_setup_component(hass, "input_boolean", {"input_boolean": {"lampe": {}}})
    # Frontend gibt es im Test nicht; als geladen markieren
    for dep in ("frontend", "panel_custom"):
        hass.config.components.add(dep)
    entry = MockConfigEntry(domain="schaltzentrale", title="Schaltzentrale")
    entry.add_to_hass(hass)
    with patch("custom_components.schaltzentrale.panel_custom.async_register_panel") as reg, \
         patch("custom_components.schaltzentrale.frontend.add_extra_js_url"), \
         patch("custom_components.schaltzentrale.frontend.async_remove_panel"), \
         patch.object(hass.http, "async_register_static_paths", AsyncMock()):
        assert await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()
        assert reg.called
    return entry, client


async def _save(client, config):
    await client.send_json_auto_id({"type": "schaltzentrale/save", "config": config})
    res = await client.receive_json()
    assert res["success"], res
    return res["result"]


async def _tick(hass, freezer, when):
    freezer.move_to(when)
    async_fire_time_changed(hass, when)
    await hass.async_block_till_done()


async def test_get_empty(hass, setup):
    _entry, client = setup
    await client.send_json_auto_id({"type": "schaltzentrale/get"})
    res = await client.receive_json()
    assert res["success"] and res["result"]["config"]["themes"] == []


async def test_schedule_switches_on_and_off(hass, setup, freezer):
    _entry, client = setup
    result = await _save(client, cfg(WIN))
    await hass.async_block_till_done()
    assert result["status"]["groups"]["fenster"]["on"] is False
    assert hass.states.get("input_boolean.lampe").state == "off"
    # Struktur geändert -> Neuladen erzeugt Entitäten
    assert hass.states.get("switch.schaltzentrale_weihnachten_aussen") is not None
    assert hass.states.get("binary_sensor.schaltzentrale_weihnachten_aussen_fenster").state == "off"

    await _tick(hass, freezer, START.replace(hour=15, second=1))
    assert hass.states.get("input_boolean.lampe").state == "on"
    assert hass.states.get("binary_sensor.schaltzentrale_weihnachten_aussen_fenster").state == "on"

    await _tick(hass, freezer, START.replace(hour=16, second=1))
    assert hass.states.get("input_boolean.lampe").state == "off"


async def test_theme_switch_off_turns_devices_off(hass, setup, freezer):
    _entry, client = setup
    await _save(client, cfg(WIN))
    await hass.async_block_till_done()
    await _tick(hass, freezer, START.replace(hour=15, minute=10))
    assert hass.states.get("input_boolean.lampe").state == "on"

    await hass.services.async_call("switch", "turn_off", {"entity_id": "switch.schaltzentrale_weihnachten_aussen"}, blocking=True)
    await hass.async_block_till_done()
    assert hass.states.get("input_boolean.lampe").state == "off"
    assert hass.states.get("binary_sensor.schaltzentrale_weihnachten_aussen_fenster").attributes["grund"] == "theme_off"


async def test_pause_freezes_and_resume_syncs(hass, setup, freezer):
    _entry, client = setup
    await _save(client, cfg(WIN))
    await hass.async_block_till_done()
    await hass.services.async_call("switch", "turn_on", {"entity_id": "switch.schaltzentrale_pause"}, blocking=True)
    await _tick(hass, freezer, START.replace(hour=15, minute=5))
    assert hass.states.get("input_boolean.lampe").state == "off"  # pausiert: nichts passiert
    await hass.services.async_call("switch", "turn_off", {"entity_id": "switch.schaltzentrale_pause"}, blocking=True)
    await hass.async_block_till_done()
    assert hass.states.get("input_boolean.lampe").state == "on"  # nach Pause auf Planstand


async def test_out_of_season_does_nothing(hass, setup, freezer):
    _entry, client = setup
    await _save(client, cfg(WIN, season={"enabled": True, "start": "11-29", "end": "01-06"}))
    await hass.async_block_till_done()
    await _tick(hass, freezer, START.replace(hour=15, minute=5))
    assert hass.states.get("input_boolean.lampe").state == "off"


async def test_invalid_config_rejected(hass, setup):
    _entry, client = setup
    bad = cfg([{"days": [0], "from": {"type": "time", "time": "99:00"}, "to": {"type": "time", "time": "10:00"}}])
    await client.send_json_auto_id({"type": "schaltzentrale/save", "config": bad})
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
    assert hass.states.get("binary_sensor.schaltzentrale_weihnachten_aussen_fenster") is None

"""Websocket commands for the panel and the card."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.util import dt as dt_util

from . import conflicts
from .const import DOMAIN, SIGNAL_UPDATE
from .models import CONFIG_SCHEMA, structure_key


def _manager(hass: HomeAssistant):
    return hass.data.get(DOMAIN, {}).get("manager")


@callback
def async_register(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, ws_get)
    websocket_api.async_register_command(hass, ws_save)
    websocket_api.async_register_command(hass, ws_subscribe)
    websocket_api.async_register_command(hass, ws_check)


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/get"})
@callback
def ws_get(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    manager = _manager(hass)
    if manager is None:
        connection.send_error(msg["id"], "not_loaded", "SwitchPlan is not loaded")
        return
    connection.send_result(msg["id"], {"config": manager.config, "status": manager.status})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/save", vol.Required("config"): dict}
)
@websocket_api.async_response
async def ws_save(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    manager = _manager(hass)
    if manager is None:
        connection.send_error(msg["id"], "not_loaded", "SwitchPlan is not loaded")
        return
    try:
        config = CONFIG_SCHEMA(msg["config"])
    except vol.Invalid as err:
        connection.send_error(msg["id"], "invalid_format", str(err))
        return

    was_paused = manager.config["paused"]
    reload = structure_key(config) != structure_key(manager.config)
    await manager.async_save(config)
    if was_paused and not config["paused"]:
        manager.evaluate(sync_all=True)
    connection.send_result(msg["id"], {"config": manager.config, "status": manager.status})
    if reload:
        # New or renamed themes and groups need new entities
        hass.data[DOMAIN]["reloading"] = True
        hass.config_entries.async_schedule_reload(hass.data[DOMAIN]["entry_id"])


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/subscribe"})
@callback
def ws_subscribe(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    @callback
    def forward() -> None:
        manager = _manager(hass)
        if manager is not None:
            connection.send_message(
                websocket_api.event_message(
                    msg["id"], {"config": manager.config, "status": manager.status}
                )
            )

    connection.subscriptions[msg["id"]] = async_dispatcher_connect(hass, SIGNAL_UPDATE, forward)
    connection.send_result(msg["id"])
    forward()


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/check"})
@callback
def ws_check(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    """Conflict check: other automations that switch the managed devices."""
    manager = _manager(hass)
    if manager is None:
        connection.send_error(msg["id"], "not_loaded", "SwitchPlan is not loaded")
        return
    tz = dt_util.get_default_time_zone()
    today = dt_util.now().astimezone(tz).date()
    groups = conflicts.check_all(hass, manager.config, today, tz, manager.sun)
    connection.send_result(msg["id"], {"groups": groups})

"""Websocket-Befehle für Panel und Karte."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect

from .const import DOMAIN, SIGNAL_UPDATE
from .models import CONFIG_SCHEMA, structure_key


def _manager(hass: HomeAssistant):
    return hass.data.get(DOMAIN, {}).get("manager")


@callback
def async_register(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, ws_get)
    websocket_api.async_register_command(hass, ws_save)
    websocket_api.async_register_command(hass, ws_subscribe)


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/get"})
@callback
def ws_get(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict[str, Any]) -> None:
    manager = _manager(hass)
    if manager is None:
        connection.send_error(msg["id"], "not_loaded", "Schaltzentrale ist nicht geladen")
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
        connection.send_error(msg["id"], "not_loaded", "Schaltzentrale ist nicht geladen")
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
        # Neue/umbenannte Themen und Gruppen brauchen neue Entitäten
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

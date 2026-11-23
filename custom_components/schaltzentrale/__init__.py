"""Schaltzentrale: Zeitpläne für Schalter, per Klick eingerichtet."""

from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.start import async_at_started

from . import websocket
from .const import (
    DOMAIN,
    PANEL_COMPONENT,
    PANEL_ICON,
    PANEL_TITLE,
    PANEL_URL_PATH,
    PLATFORMS,
    STATIC_URL,
    VERSION,
)
from .manager import Manager

_LOGGER = logging.getLogger(__name__)

type SchaltzentraleConfigEntry = ConfigEntry[Manager]


async def async_setup_entry(hass: HomeAssistant, entry: SchaltzentraleConfigEntry) -> bool:
    data = hass.data.setdefault(DOMAIN, {})

    manager = Manager(hass, last=data.get("last"))
    await manager.async_load()
    entry.runtime_data = manager
    data["manager"] = manager
    data["entry_id"] = entry.entry_id

    if not data.get("static"):
        await hass.http.async_register_static_paths(
            [StaticPathConfig(STATIC_URL, str(Path(__file__).parent / "static"), False)]
        )
        frontend.add_extra_js_url(hass, f"{STATIC_URL}/schaltzentrale-card.js?v={VERSION}")
        websocket.async_register(hass)
        data["static"] = True

    if not data.get("panel"):
        await _register_panel(hass)
        data["panel"] = True

    _remove_stale_entities(hass, entry, manager)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    @callback
    def _start(_hass: HomeAssistant) -> None:
        manager.start()

    entry.async_on_unload(async_at_started(hass, _start))
    return True


async def _register_panel(hass: HomeAssistant) -> None:
    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_URL_PATH,
        webcomponent_name=PANEL_COMPONENT,
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        module_url=f"{STATIC_URL}/schaltzentrale-panel.js?v={VERSION}",
        require_admin=True,
        config={},
    )


async def async_unload_entry(hass: HomeAssistant, entry: SchaltzentraleConfigEntry) -> bool:
    manager: Manager = entry.runtime_data
    manager.stop()
    data = hass.data.get(DOMAIN, {})
    data["last"] = manager.last
    if data.get("manager") is manager:
        data.pop("manager")
    # Beim Neuladen nach einer Änderung bleibt das Panel offen
    if not data.pop("reloading", False):
        frontend.async_remove_panel(hass, PANEL_URL_PATH)
        data["panel"] = False
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


def expected_unique_ids(entry_id: str, config: dict) -> set[str]:
    ids = {f"{entry_id}_pause"}
    for theme in config["themes"]:
        ids.add(f"{entry_id}_theme_{theme['id']}")
        for group in theme["groups"]:
            ids.add(f"{entry_id}_group_{group['id']}")
    return ids


def _remove_stale_entities(hass: HomeAssistant, entry: ConfigEntry, manager: Manager) -> None:
    """Entitäten gelöschter Themen und Gruppen aus der Registry entfernen."""
    registry = er.async_get(hass)
    wanted = expected_unique_ids(entry.entry_id, manager.config)
    for reg_entry in er.async_entries_for_config_entry(registry, entry.entry_id):
        if reg_entry.unique_id not in wanted:
            _LOGGER.debug("Entferne verwaiste Entität %s", reg_entry.entity_id)
            registry.async_remove(reg_entry.entity_id)

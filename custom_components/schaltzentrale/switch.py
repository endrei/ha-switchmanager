"""Schalter: Pause für alles und An/Aus je Thema."""

from __future__ import annotations

from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .entity import SchaltzentraleEntity
from .manager import Manager


async def async_setup_entry(hass: HomeAssistant, entry, async_add_entities: AddEntitiesCallback) -> None:
    manager: Manager = entry.runtime_data
    entities: list[SwitchEntity] = [PauseSwitch(manager, entry.entry_id)]
    entities += [ThemeSwitch(manager, entry.entry_id, t["id"], t["name"]) for t in manager.config["themes"]]
    async_add_entities(entities)


class PauseSwitch(SchaltzentraleEntity, SwitchEntity):
    """An = alle Pläne angehalten, es wird nichts geschaltet."""

    _attr_translation_key = "pause"
    _attr_icon = "mdi:pause-circle-outline"

    def __init__(self, manager: Manager, entry_id: str) -> None:
        super().__init__(manager, entry_id)
        self._attr_unique_id = f"{entry_id}_pause"

    @property
    def is_on(self) -> bool:
        return self.manager.config["paused"]

    async def async_turn_on(self, **kwargs: Any) -> None:
        await self.manager.async_update(lambda c: c.update(paused=True))

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self.manager.async_update(lambda c: c.update(paused=False))


class ThemeSwitch(SchaltzentraleEntity, SwitchEntity):
    """An/Aus eines Themas (z. B. Weihnachten Außen)."""

    _attr_icon = "mdi:string-lights"

    def __init__(self, manager: Manager, entry_id: str, theme_id: str, name: str) -> None:
        super().__init__(manager, entry_id)
        self._theme_id = theme_id
        self._attr_name = name
        self._attr_unique_id = f"{entry_id}_theme_{theme_id}"

    @property
    def available(self) -> bool:
        return self.manager.theme(self._theme_id) is not None

    @property
    def is_on(self) -> bool:
        theme = self.manager.theme(self._theme_id)
        return bool(theme and theme["active"])

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        info = self.manager.status.get("themes", {}).get(self._theme_id, {})
        theme = self.manager.theme(self._theme_id) or {}
        return {"in_saison": info.get("in_season"), "saison": theme.get("season")}

    async def _set(self, active: bool) -> None:
        def mutate(config: dict) -> None:
            for theme in config["themes"]:
                if theme["id"] == self._theme_id:
                    theme["active"] = active

        await self.manager.async_update(mutate)

    async def async_turn_on(self, **kwargs: Any) -> None:
        await self._set(True)

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self._set(False)

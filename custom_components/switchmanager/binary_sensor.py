"""Binary sensor per group: on = the plan says on right now."""

from __future__ import annotations

from typing import Any

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .entity import SwitchManagerEntity
from .manager import Manager


async def async_setup_entry(hass: HomeAssistant, entry, async_add_entities: AddEntitiesCallback) -> None:
    manager: Manager = entry.runtime_data
    async_add_entities(
        GroupPlanSensor(manager, entry.entry_id, g["id"], f"{t['name']} · {g['name']}")
        for t in manager.config["themes"]
        for g in t["groups"]
    )


class GroupPlanSensor(SwitchManagerEntity, BinarySensorEntity):
    _attr_icon = "mdi:calendar-clock"

    def __init__(self, manager: Manager, entry_id: str, group_id: str, name: str) -> None:
        super().__init__(manager, entry_id)
        self._group_id = group_id
        self._attr_name = name
        self._attr_unique_id = f"{entry_id}_group_{group_id}"

    @property
    def _info(self) -> dict:
        return self.manager.status.get("groups", {}).get(self._group_id, {})

    @property
    def available(self) -> bool:
        return self.manager.group(self._group_id) is not None

    @property
    def is_on(self) -> bool:
        return bool(self._info.get("on"))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        found = self.manager.group(self._group_id)
        info = self._info
        return {
            "reason": info.get("reason"),
            "next_change": info.get("next_change"),
            "next_state": "on" if info.get("next_state") else ("off" if info.get("next_state") is False else None),
            "switches": found[1]["entities"] if found else [],
        }

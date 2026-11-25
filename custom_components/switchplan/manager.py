"""Core of SwitchPlan: holds the configuration, evaluates schedules and switches."""

from __future__ import annotations

import copy
import logging
from datetime import date, datetime, timedelta

from homeassistant.const import SUN_EVENT_SUNRISE, SUN_EVENT_SUNSET
from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_track_point_in_time
from homeassistant.helpers.storage import Store
from homeassistant.helpers.sun import get_astral_event_date
from homeassistant.util import dt as dt_util

from . import schedule
from .const import (
    LEGACY_STORAGE_KEYS,
    REASON_PAUSED,
    REASON_PLAN,
    REASON_SEASON,
    REASON_THEME_OFF,
    SIGNAL_UPDATE,
    STORAGE_KEY,
    STORAGE_VERSION,
)
from .models import CONFIG_SCHEMA, default_config

_LOGGER = logging.getLogger(__name__)

SKIP_STATES = {"unavailable", "unknown"}


class Manager:
    """Manages themes, groups and weekly schedules."""

    def __init__(self, hass: HomeAssistant, last: dict[str, bool] | None = None) -> None:
        self.hass = hass
        self._store: Store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self.config: dict = default_config()
        # Last desired states. They survive a reload so that a reload does
        # not switch everything again.
        self._initialized = last is not None
        self._last: dict[str, bool] = dict(last or {})
        self._status: dict = {}
        self._unsub_timer: CALLBACK_TYPE | None = None
        self._started = False

    # ------------------------------------------------------------ storage
    async def async_load(self) -> None:
        stored = await self._store.async_load()
        if not stored:
            # Earlier versions were called SwitchManager / Schaltzentrale
            for key in LEGACY_STORAGE_KEYS:
                stored = await Store(self.hass, STORAGE_VERSION, key).async_load()
                if stored:
                    break
            if stored:
                _LOGGER.info("Imported configuration from %s", key)
                try:
                    await self._store.async_save(CONFIG_SCHEMA(stored))
                except Exception:  # noqa: BLE001
                    _LOGGER.exception("Could not import old configuration")
        if stored:
            try:
                self.config = CONFIG_SCHEMA(stored)
            except Exception:  # noqa: BLE001
                _LOGGER.exception("Stored configuration is invalid, starting empty")
                self.config = default_config()

    async def async_save(self, config: dict) -> None:
        self.config = CONFIG_SCHEMA(copy.deepcopy(config))
        await self._store.async_save(self.config)
        if self._started:
            self.evaluate(sync_all=False)

    async def async_update(self, mutate) -> None:
        config = copy.deepcopy(self.config)
        mutate(config)
        was_paused = self.config["paused"]
        await self.async_save(config)
        if was_paused and not self.config["paused"]:
            # After a pause, bring everything to the planned state
            self.evaluate(sync_all=True)

    # ------------------------------------------------------------ running
    @callback
    def start(self) -> None:
        self._started = True
        sync = self.config.get("sync_on_start", True) and not self._initialized
        self.evaluate(sync_all=sync)

    @property
    def last(self) -> dict[str, bool]:
        return dict(self._last)

    @callback
    def stop(self) -> None:
        self._started = False
        if self._unsub_timer:
            self._unsub_timer()
            self._unsub_timer = None

    def sun(self, kind: str, day: date) -> datetime | None:
        event = SUN_EVENT_SUNRISE if kind == "sunrise" else SUN_EVENT_SUNSET
        return get_astral_event_date(self.hass, event, day)

    def _compute(self, now: datetime) -> dict:
        tz = dt_util.get_default_time_zone()
        today = now.astimezone(tz).date()
        paused = self.config["paused"]
        groups: dict = {}
        themes: dict = {}
        for theme in self.config["themes"]:
            season_ok = schedule.in_season(theme.get("season"), today)
            themes[theme["id"]] = {"active": theme["active"], "in_season": season_ok}
            for group in theme["groups"]:
                plan = schedule.evaluate(group, now, tz, self.sun)
                if paused:
                    reason = REASON_PAUSED
                elif not theme["active"]:
                    reason = REASON_THEME_OFF
                elif not season_ok:
                    reason = REASON_SEASON
                else:
                    reason = REASON_PLAN
                active = reason == REASON_PLAN
                groups[group["id"]] = {
                    "theme": theme["id"],
                    "on": active and plan.on,
                    "reason": reason,
                    "next_change": plan.next_change.isoformat()
                    if active and plan.next_change
                    else None,
                    "next_state": plan.next_state if active else None,
                    "today": schedule.intervals_on_day(group, today, tz, self.sun),
                }
        sunrise = self.sun("sunrise", today)
        sunset = self.sun("sunset", today)
        return {
            "now": now.isoformat(),
            "paused": paused,
            "sun": {
                "sunrise": sunrise.isoformat() if sunrise else None,
                "sunset": sunset.isoformat() if sunset else None,
            },
            "themes": themes,
            "groups": groups,
        }

    @callback
    def evaluate(self, sync_all: bool = False) -> None:
        """Compute desired states, switch on changes, schedule the next run."""
        now = dt_util.now()
        status = self._compute(now)
        paused = status["paused"]

        if not paused:
            to_on: set[str] = set()
            to_off: set[str] = set()
            wanted_on: set[str] = set()
            for theme in self.config["themes"]:
                for group in theme["groups"]:
                    if status["groups"][group["id"]]["on"]:
                        wanted_on.update(group["entities"])
            for theme in self.config["themes"]:
                for group in theme["groups"]:
                    on = status["groups"][group["id"]]["on"]
                    previous = self._last.get(group["id"])
                    if previous is None and self._initialized:
                        previous = False  # new group: treat as previously off
                    if sync_all or (previous is not None and previous != on):
                        (to_on if on else to_off).update(group["entities"])
            # A switch in several groups stays on as long as one group wants it on
            to_off -= wanted_on
            self._switch(to_on, True)
            self._switch(to_off, False)
            self._last = {gid: g["on"] for gid, g in status["groups"].items()}
            self._initialized = True

        self._status = status
        self._schedule_next(now)
        async_dispatcher_send(self.hass, SIGNAL_UPDATE)

    def _schedule_next(self, now: datetime) -> None:
        if self._unsub_timer:
            self._unsub_timer()
            self._unsub_timer = None
        if not self._started:
            return
        tz = dt_util.get_default_time_zone()
        candidates: list[datetime] = []
        for theme in self.config["themes"]:
            for group in theme["groups"]:
                plan = schedule.evaluate(group, now, tz, self.sun)
                if plan.next_change:
                    candidates.append(plan.next_change)
        # Recompute after midnight at the latest (season, sun times)
        tomorrow = now.astimezone(tz).date() + timedelta(days=1)
        candidates.append(dt_util.start_of_local_day(tomorrow) + timedelta(seconds=5))
        target = max(min(candidates), now + timedelta(seconds=1))
        self._unsub_timer = async_track_point_in_time(self.hass, self._on_timer, target)

    @callback
    def _on_timer(self, _now: datetime) -> None:
        self._unsub_timer = None
        self.evaluate()

    def _switch(self, entities: set[str], on: bool) -> None:
        targets = []
        for entity_id in sorted(entities):
            state = self.hass.states.get(entity_id)
            if state is None or state.state in SKIP_STATES:
                _LOGGER.debug("%s is unavailable, skipped", entity_id)
                continue
            targets.append(entity_id)
        if not targets:
            return
        _LOGGER.info("Turning %s: %s", "on" if on else "off", ", ".join(targets))
        self.hass.async_create_task(self._call(targets, on), eager_start=True)

    async def _call(self, targets: list[str], on: bool) -> None:
        try:
            await self.hass.services.async_call(
                "homeassistant",
                "turn_on" if on else "turn_off",
                {"entity_id": targets},
                blocking=True,
            )
        except Exception:  # noqa: BLE001
            _LOGGER.exception("Switching failed: %s", ", ".join(targets))

    # ------------------------------------------------------------ reading
    @property
    def status(self) -> dict:
        return self._status

    def theme(self, theme_id: str) -> dict | None:
        return next((t for t in self.config["themes"] if t["id"] == theme_id), None)

    def group(self, group_id: str) -> tuple[dict, dict] | None:
        for theme in self.config["themes"]:
            for group in theme["groups"]:
                if group["id"] == group_id:
                    return theme, group
        return None

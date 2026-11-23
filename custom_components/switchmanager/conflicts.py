"""Conflict check: who else switches the devices that SwitchManager controls?

Looks through all automations (and the scenes they activate) for actions that
turn a managed switch on, off or toggle it, works out when they fire and
compares that with the group's weekly plan:

* conflict  - the automation does the opposite of the plan at that moment
* duplicate - the automation does the same as the plan (an old automation
              that can most likely be turned off)
* warning   - it controls the switch, but we cannot tell when (state
              triggers, toggles, time patterns ...)
* info      - disabled automations or scripts that mention the switch

The parsing part works on plain dicts and is tested without Home Assistant.
"""

from __future__ import annotations

import re
from collections.abc import Callable, Iterable, Iterator
from datetime import date, datetime, time, timedelta, tzinfo
from typing import Any

from . import schedule

WEEKDAYS = {"mon": 0, "tue": 1, "wed": 2, "thu": 3, "fri": 4, "sat": 5, "sun": 6}
ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]
LEVELS = ["conflict", "warning", "duplicate", "info"]
SWITCHING = {"turn_on": "on", "turn_off": "off", "toggle": "toggle"}
NOT_A_SWITCH = {"automation", "script", "scene", "notify", "input_select", "timer"}
TIME_RE = re.compile(r"^(\d{1,2}):(\d{2})(?::(\d{2}))?$")


def _as_list(value: Any) -> list:
    if value is None:
        return []
    if isinstance(value, (list, tuple, set)):
        return list(value)
    return [value]


def _entity_ids(value: Any) -> list[str]:
    out: list[str] = []
    for item in _as_list(value):
        if isinstance(item, str):
            out.extend(part.strip() for part in item.split(",") if part.strip())
    return out


def iter_actions(node: Any) -> Iterator[dict]:
    """All service calls anywhere in an action tree (choose, if, repeat ...)."""
    if isinstance(node, dict):
        if isinstance(node.get("action") or node.get("service"), str):
            yield node
        elif isinstance(node.get("scene"), str):
            yield {"action": "scene.turn_on", "target": {"entity_id": node["scene"]}}
        for key, value in node.items():
            if key not in ("data", "target"):
                yield from iter_actions(value)
    elif isinstance(node, list):
        for item in node:
            yield from iter_actions(item)


def _targets(action: dict) -> list[str]:
    ids = _entity_ids(action.get("entity_id"))
    for key in ("target", "data", "data_template"):
        part = action.get(key)
        if isinstance(part, dict):
            ids += _entity_ids(part.get("entity_id"))
    return ids


def effects(
    config: dict, scene_states: Callable[[str], dict[str, str]]
) -> list[tuple[str, str]]:
    """(entity_id, 'on'|'off'|'toggle') for everything an automation switches."""
    out: list[tuple[str, str]] = []
    actions = config.get("actions", config.get("action"))
    for action in iter_actions(actions):
        service = action.get("action") or action.get("service")
        if "." not in service:
            continue
        domain, name = service.split(".", 1)
        if service in ("scene.turn_on", "scene.apply"):
            states: dict[str, str] = {}
            for scene_id in _targets(action):
                states.update(scene_states(scene_id))
            data = action.get("data") or {}
            if isinstance(data.get("entities"), dict):  # scene.apply
                for entity_id, value in data["entities"].items():
                    state = value.get("state") if isinstance(value, dict) else value
                    states[entity_id] = str(state)
            for entity_id, state in states.items():
                if state in ("on", "off"):
                    out.append((entity_id, state))
            continue
        if name in SWITCHING and domain not in NOT_A_SWITCH:
            out.extend((entity_id, SWITCHING[name]) for entity_id in _targets(action))
    return out


def _offset_minutes(value: Any) -> int:
    if value is None:
        return 0
    if isinstance(value, (int, float)):
        return round(value / 60)
    if isinstance(value, timedelta):
        return round(value.total_seconds() / 60)
    if isinstance(value, dict):
        return round(
            value.get("hours", 0) * 60 + value.get("minutes", 0) + value.get("seconds", 0) / 60
        )
    text = str(value).strip()
    sign = -1 if text.startswith("-") else 1
    parts = [int(p) for p in text.lstrip("+-").split(":") if p.isdigit()]
    while len(parts) < 3:
        parts.append(0)
    return sign * (parts[0] * 60 + parts[1] + round(parts[2] / 60))


def _days(value: Any) -> list[int] | None:
    days = [WEEKDAYS[d] for d in _as_list(value) if isinstance(d, str) and d in WEEKDAYS]
    return sorted(set(days)) or None


def triggers(config: dict, state_of: Callable[[str], str | None]) -> list[dict]:
    """Normalised triggers: {kind, at|event+offset, days, label}."""
    days = None
    for cond in _as_list(config.get("conditions", config.get("condition"))):
        if isinstance(cond, dict) and cond.get("condition") == "time" and cond.get("weekday"):
            days = _days(cond.get("weekday"))
    out: list[dict] = []
    for trig in _as_list(config.get("triggers", config.get("trigger"))):
        if not isinstance(trig, dict):
            continue
        kind = trig.get("trigger") or trig.get("platform")
        trig_days = _days(trig.get("weekday")) or days or ALL_DAYS
        if kind == "time":
            for at in _as_list(trig.get("at")):
                offset = 0
                if isinstance(at, dict):
                    offset = _offset_minutes(at.get("offset"))
                    at = at.get("entity_id")
                if isinstance(at, str) and not TIME_RE.match(at):
                    at = state_of(at)  # input_datetime
                match = TIME_RE.match(at) if isinstance(at, str) else None
                if match:
                    hour = int(match[1]) + int(match[2]) / 60 + offset / 60
                    out.append({"kind": "time", "hour": round(hour, 4), "days": trig_days,
                                "label": f"{int(hour) % 24:02d}:{round((hour % 1) * 60) % 60:02d}"})
                else:
                    out.append({"kind": "other", "days": trig_days, "label": "time"})
        elif kind == "sun":
            event = trig.get("event", "sunset")
            offset = _offset_minutes(trig.get("offset"))
            out.append({"kind": "sun", "event": event, "offset": offset, "days": trig_days,
                        "label": event + (f" {offset:+d} min" if offset else "")})
        elif kind == "time_pattern":
            out.append({"kind": "pattern", "days": trig_days, "label": "time_pattern"})
        else:
            out.append({"kind": "other", "days": trig_days, "label": str(kind or "?")})
    return out


def _moment(trig: dict, day: date, tz: tzinfo, sun: schedule.SunFn) -> datetime | None:
    if trig["kind"] == "time":
        start = datetime.combine(day, time(0, 0), tzinfo=tz)
        return start + timedelta(hours=trig["hour"])
    event = sun("sunrise" if trig["event"] == "sunrise" else "sunset", day)
    if event is None:
        return None
    return event.astimezone(tz) + timedelta(minutes=trig["offset"])


def check_group(
    group: dict,
    automations: Iterable[dict],
    today: date,
    tz: tzinfo,
    sun: schedule.SunFn,
) -> list[dict]:
    """Findings for one group. Each automation dict has entity_id, name,
    enabled, edit_id, effects [(entity, verb)] and triggers (see above)."""
    managed = set(group.get("entities", []))
    findings: list[dict] = []
    for auto in automations:
        hits: dict[str, set[str]] = {}
        for entity_id, verb in auto["effects"]:
            if entity_id in managed:
                hits.setdefault(verb, set()).add(entity_id)
        if not hits:
            continue
        base = {
            "automation": {k: auto.get(k) for k in ("entity_id", "name", "edit_id", "enabled")},
        }
        if not auto.get("enabled", True):
            switches = sorted(set().union(*hits.values()))
            findings.append({**base, "level": "info", "code": "disabled", "verb": None,
                             "switches": switches, "trigger": None, "days": []})
            continue
        for verb, switches in hits.items():
            for trig in auto["triggers"] or [{"kind": "other", "days": ALL_DAYS, "label": "?"}]:
                finding = {**base, "verb": verb, "switches": sorted(switches),
                           "trigger": trig, "days": list(trig["days"])}
                if verb == "toggle":
                    findings.append({**finding, "level": "warning", "code": "toggle"})
                    continue
                if trig["kind"] not in ("time", "sun"):
                    findings.append({**finding, "level": "warning", "code": "unknown_time"})
                    continue
                against: list[int] = []
                same: list[int] = []
                hour_today = None
                for d in trig["days"]:
                    day = today + timedelta(days=(d - today.weekday()) % 7)
                    moment = _moment(trig, day, tz, sun)
                    if moment is None:
                        continue
                    if d == today.weekday() or hour_today is None:
                        hour_today = round(moment.hour + moment.minute / 60, 3)
                    plan_on = schedule.evaluate(group, moment, tz, sun).on
                    (same if plan_on == (verb == "on") else against).append(d)
                finding["hour"] = hour_today
                if against:
                    findings.append({**finding, "level": "conflict",
                                     "code": "turns_on_against_plan" if verb == "on" else "turns_off_against_plan",
                                     "days": against})
                if same:
                    findings.append({**finding, "level": "duplicate", "code": "duplicate", "days": same})
    findings.sort(key=lambda f: (LEVELS.index(f["level"]), f["automation"]["name"] or ""))
    return findings


# ---------------------------------------------------------------- HA glue
def collect_automations(hass) -> list[dict]:
    """Read every automation's configuration from Home Assistant."""
    component = hass.data.get("automation")
    entities = list(getattr(component, "entities", []) or []) if component else []

    def state_of(entity_id: str) -> str | None:
        state = hass.states.get(entity_id)
        return state.state if state else None

    def scene_states(scene_id: str) -> dict[str, str]:
        scenes = hass.data.get("scene")
        entity = scenes.get_entity(scene_id) if scenes else None
        states = getattr(getattr(entity, "scene_config", None), "states", None)
        if isinstance(states, dict):
            return {eid: getattr(st, "state", str(st)) for eid, st in states.items()}
        return {}

    out = []
    for entity in entities:
        config = getattr(entity, "raw_config", None)
        if not isinstance(config, dict):
            continue
        state = hass.states.get(entity.entity_id)
        out.append({
            "entity_id": entity.entity_id,
            "name": state.name if state else entity.entity_id,
            "enabled": bool(state and state.state == "on"),
            "edit_id": config.get("id"),
            "effects": effects(config, scene_states),
            "triggers": triggers(config, state_of),
        })
    return out


def check_all(hass, config: dict, today: date, tz: tzinfo, sun: schedule.SunFn) -> dict:
    """Findings per group id, plus unreachable switches."""
    automations = collect_automations(hass)
    result: dict = {}
    for theme in config["themes"]:
        for group in theme["groups"]:
            findings = check_group(group, automations, today, tz, sun)
            for entity_id in group["entities"]:
                state = hass.states.get(entity_id)
                if state is None or state.state in ("unavailable", "unknown"):
                    findings.append({"level": "warning", "code": "unavailable", "automation": None,
                                     "verb": None, "switches": [entity_id], "trigger": None, "days": []})
            findings.sort(key=lambda f: LEVELS.index(f["level"]))
            result[group["id"]] = findings
    return result

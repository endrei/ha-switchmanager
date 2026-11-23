"""Data model and validation of the stored configuration."""

from __future__ import annotations

import voluptuous as vol

TIME_RE = r"^(([01]\d|2[0-3]):[0-5]\d|24:00)$"
MD_RE = r"^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$"
COLOR_RE = r"^#[0-9a-fA-F]{6}$"
ID_RE = r"^[a-z0-9_]{1,32}$"
ENTITY_RE = r"^[a-z_]+\.[a-z0-9_]+$"

POINT_SCHEMA = vol.Schema(
    {
        vol.Required("type"): vol.In(["time", "sunrise", "sunset"]),
        vol.Optional("time", default="00:00"): vol.Match(TIME_RE),
        vol.Optional("offset", default=0): vol.All(
            vol.Coerce(int), vol.Range(min=-720, max=720)
        ),
    },
    extra=vol.REMOVE_EXTRA,
)

WINDOW_SCHEMA = vol.Schema(
    {
        vol.Required("days"): vol.All(
            [vol.All(vol.Coerce(int), vol.Range(min=0, max=6))],
            lambda days: sorted(set(days)),
        ),
        vol.Required("from"): POINT_SCHEMA,
        vol.Required("to"): POINT_SCHEMA,
    },
    extra=vol.REMOVE_EXTRA,
)

GROUP_SCHEMA = vol.Schema(
    {
        vol.Required("id"): vol.Match(ID_RE),
        vol.Required("name"): vol.All(str, vol.Length(min=1, max=60)),
        vol.Optional("entities", default=list): [vol.Match(ENTITY_RE)],
        vol.Optional("windows", default=list): [WINDOW_SCHEMA],
    },
    extra=vol.REMOVE_EXTRA,
)

SEASON_SCHEMA = vol.Schema(
    {
        vol.Optional("enabled", default=False): bool,
        vol.Optional("start", default="11-29"): vol.Match(MD_RE),
        vol.Optional("end", default="01-06"): vol.Match(MD_RE),
    },
    extra=vol.REMOVE_EXTRA,
)

THEME_SCHEMA = vol.Schema(
    {
        vol.Required("id"): vol.Match(ID_RE),
        vol.Required("name"): vol.All(str, vol.Length(min=1, max=60)),
        vol.Optional("color", default="#f59e0b"): vol.Match(COLOR_RE),
        vol.Optional("active", default=True): bool,
        vol.Optional("season", default=dict): SEASON_SCHEMA,
        vol.Optional("groups", default=list): [GROUP_SCHEMA],
    },
    extra=vol.REMOVE_EXTRA,
)


def _unique_ids(config: dict) -> dict:
    seen: set[str] = set()
    for theme in config["themes"]:
        for item in [theme, *theme["groups"]]:
            if item["id"] in seen:
                raise vol.Invalid(f"Duplicate id: {item['id']}")
            seen.add(item["id"])
    return config


CONFIG_SCHEMA = vol.All(
    vol.Schema(
        {
            vol.Optional("paused", default=False): bool,
            vol.Optional("sync_on_start", default=True): bool,
            vol.Optional("themes", default=list): [THEME_SCHEMA],
        },
        extra=vol.REMOVE_EXTRA,
    ),
    _unique_ids,
)


def default_config() -> dict:
    return CONFIG_SCHEMA({})


def structure_key(config: dict) -> tuple:
    """Everything that creates entities. If it changes, the entry is reloaded."""
    return tuple(
        (theme["id"], theme["name"], tuple((g["id"], g["name"]) for g in theme["groups"]))
        for theme in config["themes"]
    )

"""Constants for SwitchPlan."""

DOMAIN = "switchplan"
VERSION = "0.3.0"

STORAGE_KEY = DOMAIN
STORAGE_VERSION = 1
# Storage keys of earlier names (SwitchManager, Schaltzentrale), newest first;
# imported once if there is no SwitchPlan configuration yet
LEGACY_STORAGE_KEYS = ("switchmanager", "schaltzentrale")

PANEL_URL_PATH = "switchplan"
PANEL_COMPONENT = "switchplan-panel"
PANEL_TITLE = "SwitchPlan"
PANEL_ICON = "mdi:calendar-clock"

STATIC_URL = "/switchplan_static"

SIGNAL_UPDATE = f"{DOMAIN}_update"

PLATFORMS = ["switch", "binary_sensor"]

# Why a group is off according to its plan (used by panel and attributes)
REASON_PLAN = "plan"
REASON_THEME_OFF = "theme_off"
REASON_SEASON = "season"
REASON_PAUSED = "paused"

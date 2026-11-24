"""Constants for SwitchManager."""

DOMAIN = "switchmanager"
VERSION = "0.2.1"

STORAGE_KEY = DOMAIN
STORAGE_VERSION = 1
# Storage key of the earlier name "Schaltzentrale"; imported once if present
LEGACY_STORAGE_KEY = "schaltzentrale"

PANEL_URL_PATH = "switchmanager"
PANEL_COMPONENT = "switchmanager-panel"
PANEL_TITLE = "SwitchManager"
PANEL_ICON = "mdi:calendar-clock"

STATIC_URL = "/switchmanager_static"

SIGNAL_UPDATE = f"{DOMAIN}_update"

PLATFORMS = ["switch", "binary_sensor"]

# Why a group is off according to its plan (used by panel and attributes)
REASON_PLAN = "plan"
REASON_THEME_OFF = "theme_off"
REASON_SEASON = "season"
REASON_PAUSED = "paused"

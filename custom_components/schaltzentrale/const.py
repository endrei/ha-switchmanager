"""Konstanten der Schaltzentrale."""

DOMAIN = "schaltzentrale"
VERSION = "0.1.1"

STORAGE_KEY = DOMAIN
STORAGE_VERSION = 1

PANEL_URL_PATH = "schaltzentrale"
PANEL_COMPONENT = "schaltzentrale-panel"
PANEL_TITLE = "Schaltzentrale"
PANEL_ICON = "mdi:calendar-clock"

STATIC_URL = "/schaltzentrale_static"

SIGNAL_UPDATE = f"{DOMAIN}_update"

PLATFORMS = ["switch", "binary_sensor"]

# Gründe, warum eine Gruppe laut Plan aus ist (für Panel und Attribute)
REASON_PLAN = "plan"
REASON_THEME_OFF = "theme_off"
REASON_SEASON = "season"
REASON_PAUSED = "paused"

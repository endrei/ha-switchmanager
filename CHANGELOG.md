# Changelog

## 0.2.0 (23.11.2026)
- New name: **SwitchManager** (domain `switchmanager`). The configuration of
  Schaltzentrale is imported automatically. Entity ids are now `switchmanager_*`,
  the card is `custom:switchmanager-card`.
- Conflict check: finds other automations (and the scenes they activate) that
  switch your managed devices and compares them with your plan: conflict,
  duplicate, warning or note. Shown as a traffic light, as markers in the weekly
  plan and in a check card with "Open" and "Disable".
- Panel and card in English and German, following the Home Assistant language.
- README in English.

## 0.1.2 (23.11.2026)
- Uhrzeit direkt eintippen: Stunden und Minuten anklicken, Zahl eingeben, Enter.
- Bei Sonnenzeiten den Versatz in Minuten eintippen (z. B. -20).
- +/- gehen genau 15 Minuten weiter, auch von krummen Zeiten wie 04:48.

## 0.1.1 (23.11.2026)
- Einzelne Wochentage anpassen: Tag anklicken, „Nur <Tag> anders einstellen“.
- Prüfung: Einschalten nach Ausschalten wird abgelehnt und erklärt.
- Über Mitternacht nur noch, wenn abends ein- und morgens ausgeschaltet wird.

## 0.1.0 (23.11.2026)
- Erste Version: Themen, Gruppen, Wochenpläne (Uhrzeit oder Sonne), Saison,
  Pause, Seitenleisten-Panel, Dashboard-Karte, Entitäten.

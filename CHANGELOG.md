# Changelog

## 0.2.1 (24.11.2026)
- Disclaimer: use at your own risk, no warranty and no liability. Shown in the
  README and when adding the integration.

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
- Type times directly: click the hours or minutes, type the number, press Enter.
- For sun times, type the offset in minutes (e.g. -20).
- +/- move exactly 15 minutes, also from odd times like 04:48.

## 0.1.1 (23.11.2026)
- Change single weekdays: click a day, then "Set <day> differently".
- Check: turning on after turning off is rejected with an explanation.
- Windows run past midnight only when they turn on in the evening and off in the morning.

## 0.1.0 (23.11.2026)
- First version (then called Schaltzentrale): themes, groups, weekly plans
  (clock or sun), season, pause, sidebar panel, dashboard card, entities.

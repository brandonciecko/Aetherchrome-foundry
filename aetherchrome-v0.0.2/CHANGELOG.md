# Changelog

## 0.0.2 — 2026-07-29

### Added

- Six registered Attributes: Strength, Health, Intelligence, Agility, Charisma, and Essence.
- Separate Base and Current values for each Attribute.
- Twelve structured Skill record slots.
- Skill enable state, name, governing Attribute, and Base Skill rating.
- Actor subtype localization.
- Expanded Core Actor Record layout.

### Constraints

- Standard Attributes are presented as 1–9.
- Current Attribute values may reach 0.
- Base Skill is constrained to 0–10.

### Deliberately omitted

- Skill Registry synchronization.
- Skill Pool resolution.
- Chance Die and Overflow Dice procedures.
- Difficulty handling.
- Skill defaults and prerequisites.
- Combat automation.

## 0.0.1 — 2026-07-29

### Added

- Foundry VTT v14 system manifest.
- Aetherchrome Actor data model.
- Minimal `ActorSheetV2` implementation.
- Health resource and token-bar configuration.
- Diagnostic d10 chat roll.
- English localization and baseline styling.

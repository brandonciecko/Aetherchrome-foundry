# Aetherchrome Foundry VTT System

Native Foundry VTT implementation of **Aetherchrome**.

## Version 0.0.2 — Core Actor Record

This milestone provides:

- Foundry VTT v14 system support;
- one native `actor` Actor subtype;
- Base and Current values for all six registered Attributes;
- twelve structured Skill record slots;
- Skill name, governing Attribute, and Base Skill rating;
- editable name, concept, health resource, and notes;
- token-bar access to health;
- a diagnostic `1d10` chat roll.

The diagnostic roll is **not** the Aetherchrome Skill Pool mechanic.

## Attribute records

The sheet records:

- Strength (STR)
- Health (HLT)
- Intelligence (INT)
- Agility (AGL)
- Charisma (CHA)
- Essence (ESS)

The standard Attribute range is 1–9. Current Attribute may reach 0. Extended Attribute procedures are not automated in this release.

## Skill records

Twelve generic slots are supplied for early testing. Each slot stores:

- enabled state;
- Skill name;
- governing Attribute;
- Base Skill rating from 0–10.

These slots are intentionally generic. They are not yet synchronized with the project Skill Registry.

## Manual development installation

1. Close Foundry VTT.
2. Copy or clone this repository into `{Foundry user data}/Data/systems/aetherchrome`.
3. Confirm `system.json` is directly inside that folder.
4. Start Foundry VTT v14.
5. Create or open a world using **Aetherchrome**.
6. Existing v0.0.1 Actors should receive the new schema defaults automatically.
7. Open an Actor sheet and save Attribute and Skill values.

The folder name must be exactly `aetherchrome`, matching the manifest ID.

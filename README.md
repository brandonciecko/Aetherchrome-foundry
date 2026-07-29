# Aetherchrome Foundry VTT System

Native Foundry VTT implementation of **Aetherchrome**.

## Version 0.0.1 — Loadable Skeleton

This milestone establishes:

- a Foundry VTT v14 system manifest;
- one `actor` Actor subtype;
- a minimal native `ActorSheetV2`;
- editable name, concept, health, and notes fields;
- token-bar access to health;
- standard Foundry Scene and hex-grid compatibility;
- a diagnostic `1d10` chat roll.

The diagnostic roll is **not** the Aetherchrome Skill Pool mechanic. Gameplay procedures will be implemented only from the controlling Aetherchrome project sources.

## Manual development installation

1. Close Foundry VTT.
2. Copy or clone this repository into `{Foundry user data}/Data/systems/aetherchrome`.
3. Confirm `system.json` is directly inside that folder.
4. Start Foundry VTT v14.
5. Create a world using the **Aetherchrome** system.
6. Create an Actor of type **actor**.
7. Open the Actor sheet and test the diagnostic roll.

The folder name must be exactly `aetherchrome`, matching the manifest ID.

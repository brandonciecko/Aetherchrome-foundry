# Aetherchrome Foundry VTT System

## Version 0.0.3 — Skill Tree and Task Selection

This Foundry VTT v14 milestone replaces generic Skill slots with the current registered Alpha Skill topology.

### Added

- Hierarchical Skill tree generated from a separate catalog file.
- Root Skills, child Skills, and Specializations.
- Base Skill ratings from 0–10 on every registered node.
- Task dropdowns filtered to the selected Skill node.
- Typical Task Attribute shown in each dropdown entry.
- Current Active Working and Provisional Task records.
- Superseded and Deprecated Skills and Tasks excluded.
- Non-overlapping sheet footer.

### Data source

The catalog was transcribed from `AEC — Skill Registry v0.1` on 2026-07-29. The project registry remains the controlling authority. The included catalog is a versioned snapshot and does not live-sync with Google Sheets.

### Deliberately omitted

- Skill Pool rolls.
- Task detail dialogs.
- Difficulty evaluation.
- Requirements and item eligibility.
- Defaults, prerequisites, and parent-rating validation.
- Chained Task composition.
- Registry synchronization.

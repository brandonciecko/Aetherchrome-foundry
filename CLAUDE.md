# Aetherchrome Foundry VTT System

Foundry VTT system implementing the Aetherchrome tabletop RPG's Core Resolution
mechanics. Target Foundry version: **v14**.

## Core Rules Model

- **Base Attributes** vs **Current Attributes**: Base is the permanent stat;
  Current can be temporarily modified (e.g. by Statuses like Enfeebled). Leaving
  Actor Edit mode resets Current back to Base.
- **Effective Skill** = Base Skill + complete net pre-roll modifier, minimum 0.
- **Skill Pool roll**: roll Effective Skill d10. Each die at or below the
  relevant Current Attribute is one success. Success requires successes ≥
  Difficulty.
- **Chance Die**: at Effective Skill 0, roll one d10 as a Chance Die instead.
  Threshold is 1 for Attribute 1–3, 2 for 4–6, 3 for 7–9.
- **Critical Success**: successes ≥ 2× Difficulty (Difficulty 0 has no
  universal Critical Success).
- **Maximum HP** = 2× Base Health (HLT). **Maximum MP** = Base Essence (ESS).
- Skills use a **Base Skill hierarchy**: a child rating cannot exceed its
  immediate parent; lowering a parent auto-lowers now-illegal descendants.
  This is enforced through a validated persistence path on the Actor sheet,
  not just UI constraints — don't bypass it when adding new Skill-related
  features.

## Campaign Profiles

- The active profile is set in Foundry world settings.
- Core code reads config through `game.aetherchrome.campaign`.
- `campaign-service.mjs` supplies available Skills, Traits, Items, equipment
  packages, config values, module-provider IDs, and per-campaign exceptions
  (e.g. Alpha 0.1 excludes retired Alpha Tasks and the Triggered Skill while
  keeping their catalog records for future use).
- **Alpha 0.1 is the default profile.** When adding content, register it
  through the campaign service rather than hardcoding it into sheets/actors.

## Architecture Notes

- `actor-data.mjs` — Actor data model
- `actor-sheet.mjs` / `actor-sheet.hbs` — Actor sheet logic/template
  (ApplicationV2-based; Foundry invokes registered sheet actions with the
  sheet instance as `this` — private static helpers can't be called as
  `this.#helper()` from that receiver; invoke through the class instead and
  pass the sheet instance explicitly where needed)
- `item-sheet.mjs` / `item-sheet.hbs` — Item sheet (weapons, armor, shields,
  gear, ammunition, package records)
- `campaign.mjs` / `campaign-service.mjs` — campaign profile config and
  lookup service
- `equipment-catalog.mjs` — universal equipment catalog records
- Dialogs use `DialogV2.wait` with values read from `button.form.elements`
  (not helper return-shape assumptions) — follow this pattern for new dialogs
  to avoid the bugs fixed in v0.0.5.
- Skill Pool chat messages attach the evaluated Foundry `Roll` and honor the
  current core Roll Mode — keep new rollable actions consistent with this.
- Actor forms auto-submit changed fields. Portrait and Base Attribute changes
  are gated behind a session-only Edit-mode toggle.

## Current Implementation Boundaries (do not assume these are done)

As of v0.0.21:
- Only Standard Attributes are implemented; **Overflow Dice are not**.
- Contextual/opposed Difficulty must be entered manually by the user.
- Cooperative and opposed-test procedures are **not automated**.
- Automatic Tasks and Chained Tasks display details but **do not roll**
  (Chained Tasks show notices to prevent incorrect independent rolls).
- Task Requirements are displayed but **not mechanically enforced**.
- Aim, Reactions, Pressure costs, and Task-specific effects beyond what's
  listed below are **not automated**.
- Active Defense, Shield Block, Called Shot interactions beyond what's listed,
  and full hit-location automation are **not included**.

## What IS implemented (combat/resources)

- Weapon Attack workflow: Skill+Attribute roll, Passive Defense (half target
  Agility, rounded up), Initial Aim (+1 shared offset), manual Active Defense
  adjustment, Final Aim (only nonnegative portion affects Damage), weapon
  Damage Pool, Armor reduction, resulting HP Damage — posted as linked chat
  cards honoring Roll Mode.
- Heavy Blow (Attack Attribute → Strength, doubles only weapon Item Rating
  contribution) and Called Shot (Location Depth as Effective Skill penalty),
  including their combination; Pressure costs apply after the full Attack.
- Ranged bow attacks: range-increment penalties, ammunition loading/reload
  from Actor inventory, arrow consumption on resolution.
- Equipment packages: 5 approved Alpha 0.1 packages; applying one creates the
  registered Items and records the package ID. Restricted to Actors with no
  existing Items and no recorded package — don't remove this guard casually.
- Encumbrance (from Total Carried Load vs Current Strength) and Statuses:
  Encumbered (penalizes only Agility-paired Tasks), Fatigued (penalizes every
  test), Enfeebled (reduces Current Strength), Dead/Comatose/Incapacitated/
  Stunned (block ordinary actions/rolls). Status refresh from Load is manual
  (Refresh Encumbrance Statuses button) — turn-based automation isn't wired
  up yet.
- Death Check interval and low-HP Incapacitation Difficulty are derived and
  displayed from current HP.
- Task search: live filter by name/owning Skill/Task ID, with a document-level
  overlay so results render above ApplicationV2 sheet content.

## Working Conventions

- When adding a rule/mechanic, check whether it belongs in generic code vs. a
  campaign-profile exception before hardcoding it.
- Don't silently "finish" a listed boundary (e.g. auto-rolling Automatic
  Tasks) unless explicitly asked — several are intentionally left manual for
  this Alpha.
- Match existing chat-card and Roll-mode conventions for any new rollable
  action.
- Update `CHANGELOG.md` with a dated/versioned entry describing what was
  added and what boundaries remain, matching the existing style.

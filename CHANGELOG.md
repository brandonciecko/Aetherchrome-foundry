# Changelog

## 0.0.12 — 2026-07-29

### Added

- Foundry Scene token targeting in the Weapon Attack workflow.
- Requirement to target exactly one Actor token.
- Automatic target name and Actor resolution.
- Target Agility read directly from the targeted Actor.
- Passive Defense calculated from the targeted Actor instead of manual target data.
- Automatic torso Armor lookup from worn Armor Items.
- Highest applicable persistent Armor value used when multiple worn Armor Items cover the torso.
- Approximate bow distance prefilled from attacker and target token positions.
- Optional direct HP Damage application to the targeted Actor.
- Ownership and GM permission checking before target HP is updated.
- Target HP before-and-after values in the Damage chat card.

### Current workflow

1. Place two linked Actor tokens on a Scene.
2. Ready the attacker's weapon.
3. Target the defender with Foundry's Target tool or `T`.
4. Open the attacker's Actor sheet.
5. Click the Weapon Attack control.
6. Resolve the Attack and Damage dialog.
7. Apply net HP Damage to the targeted Actor when permitted.

### Rule boundaries

- Normal attacks target the torso.
- Current standard attacks use target Agility for Passive Defense.
- Active Defense remains a manual Aim adjustment.
- Cover remains manually selected.
- Torso Armor may be manually overridden in the attack dialog.
- Shield Block Armor and hit-location selection remain deferred.
- Automatic range measurement is a convenience value and may be manually corrected.

## 0.0.11 — 2026-07-29

### Added

- World-level Campaign Profile setting.
- CampaignRegistry and CampaignService.
- Alpha 0.1 campaign profile as the default.
- Campaign-driven Skill, Trait, Item, and equipment-package availability.
- Module-provider slots for magic, combat, and encumbrance.
- Structured campaign exceptions.
- Active campaign badge on Actor sheets.
- Aetherchrome: Alpha system banner.

### Changed

- System display title is now `Aetherchrome: Alpha`.
- System ID remains `aetherchrome`.
- Skill Tree and equipment package availability now route through the active campaign service.
- Existing Alpha behavior remains unchanged by default.

## 0.0.10 — 2026-07-29

### Added

- Weapon Attack button on embedded Weapon Items.
- Attack dialog driven by the selected embedded weapon.
- Skill and acting Attribute selection.
- Pressure, Open Skill Effort, situational modifiers, Take Aim bonuses, and ranged increment penalties in Effective Skill.
- Passive Defense calculated as half the entered target Attribute, rounded up.
- Cover modifiers of 0–2 added to Passive Defense.
- Initial Aim and Final Aim calculation.
- Manual active-defense Aim adjustment pending Reaction automation.
- Damage Pool calculation from Final Aim, weapon Item Rating, grip modifier, and explicit damage modifiers.
- Damage Pool rolls against a selected damage Attribute.
- Final Armor subtraction and resulting HP Damage display.
- Linked Attack and Damage chat cards.
- Foundry Public, GM, Blind, and Self roll-mode handling for both rolls.
- Bow ammunition capacity and loaded-ammunition tracking.
- Reload control that transfers compatible ammunition from the Actor to the bow.
- Shoot consumption of loaded ammunition and removal of Ready.
- Weapon fields for damage Attribute, Range Increment, Maximum Increments, and ammunition type.

### Rule boundaries

- Active Defense is represented by a manual Aim adjustment; no Reaction roll automation is included.
- Final Armor is entered manually; location coverage and Shield Block Armor are not yet calculated automatically.
- HP Damage is reported but not automatically applied to a target Actor.
- Take Aim is entered as an explicit bonus rather than stored as a target-bound effect.
- Heavy Blow and Called Shot are not automated in this release.
- Reload and Draw Bow timing are represented through inventory controls; Encounter action-economy enforcement remains deferred.

## 0.0.9 — 2026-07-29

### Added

- Native Foundry Item document types: Weapon, Armor, Shield, Gear, Ammunition, and Package.
- Shared Aetherchrome Item data model implementing universal Item identity, Item Rating, quantity, Load, Ready state, carry/wear state, configuration, coverage, resource, and notes fields.
- Native ItemSheetV2 sheet for all Aetherchrome Item types.
- Actor Items and Equipment section.
- Embedded Item editing and removal.
- Quantity decrement/increment controls.
- Ready-state toggle.
- Ammunition and resource decrement/increment controls.
- Aggregate carried Load calculation.
- Alpha package selector and one-click package application.
- Registered Alpha item records required by Sentinel, Shieldbearer, Vanguard, Breaker, and Marksman packages.
- Actor fields for package ID, shield arm, and current Encumbrance.

### Package safeguards

- An Actor may not apply a second package while a package ID is recorded.
- Package application is blocked when embedded Items already exist.
- Package contents begin with the campaign-established worn, carried, Ready, and ammunition states.
- Package application creates native embedded Item documents rather than static sheet rows.

### Deferred

- Automated Encumbrance thresholds and Status application.
- Attack, Aim, Damage Pool, Armor, Shield Block, and ammunition-consumption automation.
- World compendium generation and registry synchronization.
- Item modifiers, material composition automation, and construction calculations.

## 0.0.8 — 2026-07-29

### Added

- Derived Maximum HP from Base HLT.
- Derived Maximum MP from Base ESS.
- Compact HP and MP decrement/value/increment controls.
- Alpha Foundry tracking floor of negative five times each resource maximum.
- Visual HP states at 0 and negative Health intervals.
- Visual MP warning below 0.
- Effort popup beside MP.
- Open Skill Effort, Active Defense Effort, and specified-cost MP spending.
- Pending Open Skill and Active Defense Effort indicators.
- Foundry roll-mode-aware Skill Pool chat messages.

### Changed

- New Skill Trees start fully collapsed.
- Skill Tree expansion state remains per-user and per-Actor after interaction.
- Skill Pool chat output now attaches the evaluated Roll and honors Public, GM, Blind, and Self roll modes.
- Open Skill Effort is consumed by the next Skill Pool roll and adds +1 Effective Skill.
- HP and MP maxima are synchronized from Base HLT and Base ESS.

### Deferred

- Automatic Incapacitation, Death, and Comatose procedures.
- Automatic Active Defense Effort consumption.
- Item and Equipment documents.

## 0.0.7 — 2026-07-29

### Added

- Secondary Attributes section between Attributes and Skills.
- Current and Maximum HP fields.
- Current and Maximum MP fields.
- Compact Pressure control with decrement, current value, and increment controls.
- Automatic Pressure penalty on every Skill Pool roll.
- Expandable and collapsible Skill Tree branches.
- Expand All and Collapse All controls.
- Per-user Skill Tree expansion state for each Actor.

### Changed

- Skills and Tasks no longer display suggested or governing Attributes.
- Every ordinary Skill Pool roll requires explicit selection from all six Current Attributes.
- The Task Details panel no longer displays Typical Attribute.
- Situational modifiers and Pressure are shown separately in the roll dialog and chat result.
- HP, MP, and Pressure now appear before the Skill Tree.

### Rules implemented

- Alpha 0.1 Pressure is bounded from 0 through 4.
- Effective Skill is reduced by Current Pressure on Skill rolls.
- Pressure does not alter the selected Current Attribute or Difficulty.

## 0.0.6 — 2026-07-29

### Fixed

- Corrected Foundry action callback receiver handling.
- Private static Task helpers are now invoked through `AetherchromeActorSheet`, not the sheet-bound `this`.
- The sheet instance is passed explicitly into the Skill Pool roller.
- Actor and speaker resolution now use the supplied sheet instance.

## 0.0.5 — 2026-07-29

### Fixed

- Replaced fragile Skill Pool dialog result handling with an explicit Foundry v14 `DialogV2.wait` button callback.
- Read roll fields directly from the submitted dialog form.
- Added roll error reporting to the Foundry console and UI.
- Added governing-Attribute validation.
- Made the login banner read the installed manifest version dynamically.

### Retained

- Task Details.
- Standard Skill Pool resolution.
- Chance Die handling.
- Success, Margin, and Critical Success chat output.
- Automatic and Chained Task safeguards.

## 0.0.4 — 2026-07-29

### Added

- Task Details / Roll controls.
- Core Skill Pool dialog.
- Governing Current Attribute selection.
- Effective Skill modifier and Difficulty inputs.
- Chance Die procedure.
- Success, Margin, and Critical Success evaluation.
- Structured roll chat cards.
- Automatic and Chained Task safeguards.

### Not yet implemented

- Overflow Dice.
- Opposed and Cooperative Test automation.
- Task requirements enforcement.
- Aim, damage, Pressure, Reactions, and Task-specific effects.
- Parent Skill prerequisites and rating validation.

## 0.0.3 — 2026-07-29

- Added registered Skill Tree and Task selection.

## 0.0.2 — 2026-07-29

- Added Core Actor Record.

## 0.0.1 — 2026-07-29

- Added Foundry v14 loadable skeleton.

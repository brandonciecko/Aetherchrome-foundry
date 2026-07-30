# Aetherchrome Foundry VTT System

## Version 0.0.15 — Actor Sheet Maintenance

This Foundry VTT v14 milestone adds the first playable implementation of Aetherchrome Core Resolution.

### Added

- Task Details / Roll button beside each registered Task selection.
- Task status, typical Attribute, resolution type, Difficulty guidance, time, requirements, and Tags.
- Governing Current Attribute selection for Tasks with valid alternatives.
- Net Effective Skill modifier input.
- Editable Difficulty input.
- Standard Skill Pool rolls.
- Chance Die rolls at Effective Skill 0.
- Success counting against Current Attribute.
- Success, Failure, Margin, and Critical Success results.
- Structured chat cards with individual die results.
- Automatic Task notices.
- Chained Task notices that prevent incorrect independent rolls.

### Implemented core rules

- Effective Skill = Base Skill plus the complete net pre-roll modifier, minimum 0.
- Roll Effective Skill d10.
- Each normal die at or below Current Attribute produces one success.
- Success requires successes equal to or greater than Difficulty.
- At Effective Skill 0, roll one Chance Die.
- Chance Die threshold is 1 for Attribute 1–3, 2 for 4–6, and 3 for 7–9.
- Critical Success requires at least twice Difficulty; Difficulty 0 has no universal Critical Success.

### Current boundaries

- Standard Attributes only; Overflow Dice are not yet implemented.
- Contextual and opposed Difficulty must be entered by the user.
- Cooperative and opposed-test procedures are not automated.
- Automatic Tasks display details but do not roll.
- Chained Tasks display details but do not roll independently.
- Requirements are displayed but not mechanically enforced.
- Damage, Aim, Reactions, Pressure, and Task-specific effects are not automated.


## v0.0.5 dialog correction

The Skill Pool dialog now uses a custom `DialogV2.wait` submission callback and reads values from `button.form.elements`. This avoids reliance on helper return-shape behavior and reports unexpected roll errors in the Foundry console.


## v0.0.6 action correction

Foundry invokes registered sheet actions with the Actor sheet instance as `this`.
Private static helpers cannot be called as `this.#helper()` from that receiver.
The Task action now invokes helpers through the class and passes the sheet
instance explicitly to the Skill Pool roller.


## v0.0.7 sheet behavior

The Actor sheet now places HP, MP, and Pressure after Attributes and before
Skills. Pressure uses compact minus/value/plus controls and is automatically
subtracted from Effective Skill on Skill Pool rolls.

Skills are Attribute-agnostic in the interface. Task labels do not display
suggested Attributes, and each ordinary roll requires an explicit selection
from all six Current Attributes.

Skill branches can be expanded or collapsed. Expansion state is stored per
Foundry user and per Actor.


## v0.0.8 behavior

Maximum HP is derived from Base HLT and Maximum MP from Base ESS. New Actors
start at those maxima. HP and MP use compact decrement/value/increment controls
and are bounded in this Alpha tracker from negative five times maximum through
maximum.

The Effort dialog supports the current Alpha MP expenditure categories. Open
Skill Effort is consumed by the next Skill Pool roll. Active Defense Effort is
recorded as pending until Active Defense automation is implemented.

Skill Pool messages attach the evaluated Foundry Roll and honor the current
core Roll Mode. Skill Trees start fully collapsed for users without saved
expansion state.


## v0.0.9 Items and Equipment

Aetherchrome now provides native Foundry Item documents for weapons, armor,
shields, gear, ammunition, and package records. Items can be created in the
Items directory, dragged onto Actors, edited as embedded documents, marked
Ready, assigned carry or wear locations, and tracked for quantity, Load, and
resources.

The Actor sheet includes the five approved Alpha 0.1 equipment packages.
Applying a package creates the package's registered Item documents and records
the package ID. Package application is intentionally restricted to Actors with
no existing embedded Items and no recorded package.

This release establishes the data and interface foundation. It does not yet
automate attack resolution, Damage Pools, Armor, Shield Block, Encumbrance
Statuses, or ammunition consumption.


## v0.0.10 Attack and Damage

Ready Weapon Items now provide an Attack control. The workflow rolls the
selected Skill and Attribute, calculates Passive Defense, Initial Aim, manual
active-defense adjustment, Final Aim, the weapon-based Damage Pool, damage
successes, Armor reduction, and resulting HP Damage.

Ranged bow attacks apply range-increment penalties and require loaded
ammunition. Reload transfers one compatible arrow from the Actor's ammunition
Item into the bow. A resolved bow attack consumes the loaded arrow and removes
Ready.

Attack and Damage are posted as linked chat cards using Foundry's current Roll
Mode. Automatic targeting, Reaction rolls, location Armor lookup, target HP
application, Heavy Blow, Called Shot, and Take Aim effect storage remain for
later combat milestones.


## Campaign profiles

The active campaign profile is selected in Foundry's world settings. Core code
accesses campaign configuration through `game.aetherchrome.campaign`.

The campaign service supplies available Skills, Traits, Items, equipment
packages, configuration values, module-provider IDs, and explicit campaign
exceptions. Alpha 0.1 remains the default profile.


## Scene combat workflow

To attack another Actor:

1. Place linked tokens for both Actors on an active Scene.
2. Set the attacker's weapon to Ready.
3. Use Foundry's target tool, or hover over the defender and press `T`, so exactly
   one token is targeted.
4. Open the attacker's sheet and click the crosshair button beside the weapon.
5. Resolve the Attack dialog.

The system reads the targeted Actor's Agility, calculates Passive Defense,
finds the highest worn torso Armor value, resolves Aim and Damage, and can
subtract net HP Damage directly from the target.

Active Defense, Shield Block, Called Shot, and full hit-location automation are
not included in this milestone.


## Actor-sheet maintenance

Actor forms now submit changed fields automatically. Skill ratings use an
additional validated persistence path that enforces the Base Skill hierarchy:
a child cannot exceed its immediate parent, and lowering a parent lowers any
now-illegal descendants.

Current MP may fall below 0 and remains capped only at Maximum MP. The Actor
sheet also includes a session-only Edit toggle. Portrait changes are available
only while Edit mode is enabled.

The Alpha campaign profile now excludes the retired Alpha Tasks and the
Triggered Skill while preserving their universal catalog records for possible
future campaign use.

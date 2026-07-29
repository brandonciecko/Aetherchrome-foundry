# Aetherchrome Foundry VTT System

## Version 0.0.6 — Task Action Receiver Fix

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

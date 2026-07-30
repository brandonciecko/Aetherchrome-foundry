import { SKILL_CATALOG, TASK_CATALOG } from "../../catalogs/skill-catalog.mjs";
import { ALPHA_ITEMS, ALPHA_PACKAGES } from "../../catalogs/equipment-catalog.mjs";

const EXCLUDED_ALPHA_SKILLS = new Set([
  "SKL-TRIGGERED"
]);

const EXCLUDED_ALPHA_TASKS = new Set([
  "TASK-FIGHT-RECOGNIZE-VIOLENCE",
  "TASK-FIGHT-IMPROVISED-AGGRESSION",
  "TASK-FIGHT-SHOVE",
  "TASK-MELEE-BASIC-ATTACK",
  "TASK-MELEE-BASIC-PARRY",
  "TASK-MELEE-IMPROVISED-BLOCK",
  "TASK-ACROBATICS-RECOVER-BALANCE"
]);

export const ALPHA_01_PROFILE = {
  id: "alpha-01",
  name: "Aetherchrome: Alpha 0.1",
  version: "0.1",
  status: "ACTIVE WORKING",

  availability: {
    skills: SKILL_CATALOG
      .filter(skill => !EXCLUDED_ALPHA_SKILLS.has(skill.id))
      .map(skill => skill.id),
    tasks: TASK_CATALOG
      .filter(task => !EXCLUDED_ALPHA_TASKS.has(task.id))
      .map(task => task.id),
    traits: [],
    items: Object.keys(ALPHA_ITEMS)
  },

  equipmentPackages: ALPHA_PACKAGES,

  modules: {
    magic: "none",
    combat: "alpha-combat",
    encumbrance: "core-encumbrance"
  },

  configuration: {
    startingPoints: 50,
    disadvantageRecoveryCap: 10,
    pressureCap: 4,
    startingSkillMaximum: 6
  },

  exceptions: []
};

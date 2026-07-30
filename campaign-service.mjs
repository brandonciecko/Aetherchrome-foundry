import { SKILL_CATALOG } from "../../catalogs/skill-catalog.mjs";
import { ALPHA_ITEMS, ALPHA_PACKAGES } from "../../catalogs/equipment-catalog.mjs";

export const ALPHA_01_PROFILE = {
  id: "alpha-01",
  name: "Aetherchrome: Alpha 0.1",
  version: "0.1",
  status: "ACTIVE WORKING",

  availability: {
    skills: SKILL_CATALOG.map(skill => skill.id),
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

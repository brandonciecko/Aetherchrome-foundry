import { SKILL_CATALOG, TASK_CATALOG } from "../catalogs/skill-catalog.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

const ATTRIBUTE_DEFINITIONS = [
  { key: "strength", label: "AETHERCHROME.AttributeStrength", abbreviation: "STR" },
  { key: "health", label: "AETHERCHROME.AttributeHealth", abbreviation: "HLT" },
  { key: "intelligence", label: "AETHERCHROME.AttributeIntelligence", abbreviation: "INT" },
  { key: "agility", label: "AETHERCHROME.AttributeAgility", abbreviation: "AGL" },
  { key: "charisma", label: "AETHERCHROME.AttributeCharisma", abbreviation: "CHA" },
  { key: "essence", label: "AETHERCHROME.AttributeEssence", abbreviation: "ESS" }
];

function dataKey(skillId) {
  return skillId.toLowerCase().replace("skl-", "").replaceAll("-", "_");
}

function buildTree(actor) {
  const byParent = new Map();
  for (const skill of SKILL_CATALOG) {
    const parent = skill.parentId ?? "ROOT";
    const children = byParent.get(parent) ?? [];
    children.push(skill);
    byParent.set(parent, children);
  }

  const buildNode = (skill, depth = 0) => {
    const key = dataKey(skill.id);
    const record = actor.system.skillTree[key];
    const tasks = TASK_CATALOG
      .filter(task => task.skillId === skill.id)
      .map(task => ({...task, selected: task.id === record.selectedTask}));

    return {
      ...skill,
      key,
      depth,
      indent: depth * 18,
      rating: record.rating,
      selectedTask: record.selectedTask,
      tasks,
      hasTasks: tasks.length > 0,
      children: (byParent.get(skill.id) ?? []).map(child => buildNode(child, depth + 1))
    };
  };

  return (byParent.get("ROOT") ?? []).map(skill => buildNode(skill));
}

function flattenTree(nodes) {
  const rows = [];
  for (const node of nodes) {
    rows.push(node);
    rows.push(...flattenTree(node.children));
  }
  return rows;
}

export class AetherchromeActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["aetherchrome", "actor-sheet"],
    position: { width: 820, height: 760 },
    form: { closeOnSubmit: false },
    actions: {
      diagnosticRoll: AetherchromeActorSheet.#onDiagnosticRoll
    }
  };

  static PARTS = {
    form: { template: "systems/aetherchrome/templates/actor/actor-sheet.hbs" }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const tree = buildTree(this.actor);

    return foundry.utils.mergeObject(context, {
      actor: this.actor,
      system: this.actor.system,
      editable: this.isEditable,
      attributes: ATTRIBUTE_DEFINITIONS.map(definition => ({
        ...definition,
        value: this.actor.system.attributes[definition.key]
      })),
      skillRows: flattenTree(tree)
    }, { inplace: false });
  }

  static async #onDiagnosticRoll(event) {
    event.preventDefault();
    const roll = await new Roll("1d10").evaluate();
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `${this.actor.name}: Aetherchrome diagnostic d10`
    });
  }
}

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

export class AetherchromeActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["aetherchrome", "actor-sheet"],
    position: {
      width: 760,
      height: 720
    },
    form: {
      closeOnSubmit: false
    },
    actions: {
      diagnosticRoll: AetherchromeActorSheet.#onDiagnosticRoll
    }
  };

  static PARTS = {
    form: {
      template: "systems/aetherchrome/templates/actor/actor-sheet.hbs"
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    const attributes = ATTRIBUTE_DEFINITIONS.map(definition => ({
      ...definition,
      value: this.actor.system.attributes[definition.key]
    }));

    const skills = Object.entries(this.actor.system.skills).map(([key, skill]) => ({
      key,
      ...skill
    }));

    return foundry.utils.mergeObject(context, {
      actor: this.actor,
      system: this.actor.system,
      editable: this.isEditable,
      attributes,
      skills,
      attributeChoices: ATTRIBUTE_DEFINITIONS
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

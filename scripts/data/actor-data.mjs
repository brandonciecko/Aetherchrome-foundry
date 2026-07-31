const fields = foundry.data.fields;

const ATTRIBUTE_KEYS = [
  "strength", "health", "intelligence", "agility", "charisma", "essence"
];

const SKILL_KEYS = [
  "fight",
  "melee",
  "swords",
  "knives",
  "shield",
  "ranged",
  "thrown",
  "bow",
  "triggered",
  "movement",
  "acrobatics",
  "dodge",
  "running",
  "awareness",
  "observation",
  "subterfuge",
  "stealth",
  "concealment",
  "warfare",
  "tactics",
  "knowledge",
  "medicine",
  "physician",
  "craft",
  "craft_weapons",
  "fletcher",
  "focus",
  "composure",
  "concentration",
  "self_control"
];

function attributeField() {
  return new fields.SchemaField({
    base: new fields.NumberField({required: true, nullable: false, integer: true, initial: 4, min: 1}),
    current: new fields.NumberField({required: true, nullable: false, integer: true, initial: 4, min: 0})
  });
}

function skillField() {
  return new fields.SchemaField({
    rating: new fields.NumberField({
      required: true, nullable: false, integer: true, initial: 0, min: 0, max: 10
    }),
    selectedTask: new fields.StringField({
      required: true, nullable: false, initial: ""
    })
  });
}

export class AetherchromeActorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      concept: new fields.StringField({required: true, nullable: false, initial: ""}),
      playerName: new fields.StringField({required: true, nullable: false, initial: ""}),
      shortDescription: new fields.StringField({required: true, nullable: false, initial: ""}),
      facing: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0, max: 5}),
      economy: new fields.SchemaField({
        wealth: new fields.StringField({required: true, nullable: false, initial: "Ordinary"}),
        possessionAllowance: new fields.NumberField({required: true, nullable: false, initial: 1000, min: 0}),
        possessionValue: new fields.NumberField({required: true, nullable: false, initial: 0, min: 0}),
        convertedFunds: new fields.NumberField({required: true, nullable: false, initial: 0, min: 0}),
        funds: new fields.NumberField({required: true, nullable: false, initial: 20, min: 0})
      }),
      equipment: new fields.SchemaField({
        packageId: new fields.StringField({required: true, nullable: false, initial: ""}),
        shieldArm: new fields.StringField({required: true, nullable: false, initial: ""}),
        currentEncumbrance: new fields.StringField({required: true, nullable: false, initial: ""})
      }),
      attributes: new fields.SchemaField(
        Object.fromEntries(ATTRIBUTE_KEYS.map(key => [key, attributeField()]))
      ),
      skillTree: new fields.SchemaField(
        Object.fromEntries(SKILL_KEYS.map(key => [key, skillField()]))
      ),
      resources: new fields.SchemaField({
        health: new fields.SchemaField({
          value: new fields.NumberField({required: true, nullable: false, integer: true, initial: 8}),
          max: new fields.NumberField({required: true, nullable: false, integer: true, initial: 8, min: 0})
        }),
        magic: new fields.SchemaField({
          value: new fields.NumberField({required: true, nullable: false, integer: true, initial: 4}),
          max: new fields.NumberField({required: true, nullable: false, integer: true, initial: 4, min: 0})
        }),
        pressure: new fields.NumberField({
          required: true, nullable: false, integer: true, initial: 0, min: 0, max: 4
        }),
        effort: new fields.SchemaField({
          openSkill: new fields.BooleanField({required: true, nullable: false, initial: false}),
          activeDefense: new fields.BooleanField({required: true, nullable: false, initial: false}),
          pendingType: new fields.StringField({required: true, nullable: false, initial: ""}),
          pendingCost: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0})
        })
      }),
      anatomy: new fields.ArrayField(
        new fields.SchemaField({
          id: new fields.StringField({required: true, nullable: false, initial: ""}),
          name: new fields.StringField({required: true, nullable: false, initial: ""}),
          parent: new fields.StringField({required: true, nullable: false, initial: ""}),
          depth: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0}),
          laterality: new fields.StringField({required: true, nullable: false, initial: ""}),
          locationType: new fields.StringField({required: true, nullable: false, initial: "standard"})
        }),
        {required: true, nullable: false, initial: []}
      ),
      takeAim: new fields.SchemaField({
        active: new fields.BooleanField({required: true, nullable: false, initial: false}),
        targetActorId: new fields.StringField({required: true, nullable: false, initial: ""}),
        itemId: new fields.StringField({required: true, nullable: false, initial: ""}),
        bonus: new fields.NumberField({required: true, nullable: false, integer: true, initial: 0, min: 0})
      }),
      statuses: new fields.ArrayField(
        new fields.SchemaField({
          id: new fields.StringField({required: true, nullable: false, initial: ""}),
          statusId: new fields.StringField({required: true, nullable: false, initial: ""}),
          name: new fields.StringField({required: true, nullable: false, initial: ""}),
          intensity: new fields.NumberField({required: true, nullable: false, integer: true, initial: 1, min: 0}),
          source: new fields.StringField({required: true, nullable: false, initial: "Manual"}),
          location: new fields.StringField({required: true, nullable: false, initial: ""}),
          relatedActorId: new fields.StringField({required: true, nullable: false, initial: ""}),
          automatic: new fields.BooleanField({required: true, nullable: false, initial: false})
        }),
        {required: true, nullable: false, initial: []}
      ),
      notes: new fields.HTMLField({required: true, nullable: false, initial: ""})
    };
  }
}

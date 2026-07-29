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
  "focus"
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
      attributes: new fields.SchemaField(
        Object.fromEntries(ATTRIBUTE_KEYS.map(key => [key, attributeField()]))
      ),
      skillTree: new fields.SchemaField(
        Object.fromEntries(SKILL_KEYS.map(key => [key, skillField()]))
      ),
      resources: new fields.SchemaField({
        health: new fields.SchemaField({
          value: new fields.NumberField({required: true, nullable: false, integer: true, initial: 4}),
          max: new fields.NumberField({required: true, nullable: false, integer: true, initial: 4, min: 0})
        }),
        magic: new fields.SchemaField({
          value: new fields.NumberField({required: true, nullable: false, integer: true, initial: 4, min: 0}),
          max: new fields.NumberField({required: true, nullable: false, integer: true, initial: 4, min: 0})
        }),
        pressure: new fields.NumberField({
          required: true, nullable: false, integer: true, initial: 0, min: 0, max: 4
        }),
        effort: new fields.SchemaField({
          openSkill: new fields.BooleanField({required: true, nullable: false, initial: false}),
          activeDefense: new fields.BooleanField({required: true, nullable: false, initial: false})
        })
      }),
      notes: new fields.HTMLField({required: true, nullable: false, initial: ""})
    };
  }
}

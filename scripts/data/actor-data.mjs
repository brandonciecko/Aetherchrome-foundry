const fields = foundry.data.fields;

const ATTRIBUTE_KEYS = [
  "strength",
  "health",
  "intelligence",
  "agility",
  "charisma",
  "essence"
];

const SKILL_SLOT_KEYS = Array.from(
  { length: 12 },
  (_, index) => `slot${String(index + 1).padStart(2, "0")}`
);

function attributeField() {
  return new fields.SchemaField({
    base: new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 4,
      min: 1
    }),
    current: new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 4,
      min: 0
    })
  });
}

function skillField() {
  return new fields.SchemaField({
    enabled: new fields.BooleanField({
      required: true,
      nullable: false,
      initial: false
    }),
    name: new fields.StringField({
      required: true,
      nullable: false,
      initial: ""
    }),
    attribute: new fields.StringField({
      required: true,
      nullable: false,
      initial: "agility"
    }),
    rating: new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 0,
      min: 0,
      max: 10
    })
  });
}

export class AetherchromeActorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      concept: new fields.StringField({
        required: true,
        nullable: false,
        initial: ""
      }),
      attributes: new fields.SchemaField(
        Object.fromEntries(ATTRIBUTE_KEYS.map(key => [key, attributeField()]))
      ),
      skills: new fields.SchemaField(
        Object.fromEntries(SKILL_SLOT_KEYS.map(key => [key, skillField()]))
      ),
      resources: new fields.SchemaField({
        health: new fields.SchemaField({
          value: new fields.NumberField({
            required: true,
            nullable: false,
            integer: true,
            initial: 10,
            min: 0
          }),
          max: new fields.NumberField({
            required: true,
            nullable: false,
            integer: true,
            initial: 10,
            min: 0
          })
        })
      }),
      notes: new fields.HTMLField({
        required: true,
        nullable: false,
        initial: ""
      })
    };
  }
}

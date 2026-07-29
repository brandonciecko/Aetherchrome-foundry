const fields = foundry.data.fields;

export class AetherchromeItemData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      registryId: new fields.StringField({required: true, nullable: false, initial: ""}),
      recordVersion: new fields.StringField({required: true, nullable: false, initial: ""}),
      recordStatus: new fields.StringField({required: true, nullable: false, initial: "PROVISIONAL"}),
      primaryCategory: new fields.StringField({required: true, nullable: false, initial: ""}),
      tags: new fields.StringField({required: true, nullable: false, initial: ""}),
      description: new fields.HTMLField({required: true, nullable: false, initial: ""}),
      itemRating: new fields.NumberField({
        required: true, nullable: false, integer: true, initial: 0
      }),
      quantity: new fields.NumberField({
        required: true, nullable: false, integer: true, initial: 1, min: 0
      }),
      load: new fields.NumberField({
        required: true, nullable: false, initial: 0, min: 0
      }),
      ready: new fields.BooleanField({required: true, nullable: false, initial: false}),
      worn: new fields.BooleanField({required: true, nullable: false, initial: false}),
      carryLocation: new fields.StringField({required: true, nullable: false, initial: ""}),
      wearLocation: new fields.StringField({required: true, nullable: false, initial: ""}),
      grip: new fields.StringField({required: true, nullable: false, initial: ""}),
      configuration: new fields.StringField({required: true, nullable: false, initial: ""}),
      coverage: new fields.StringField({required: true, nullable: false, initial: ""}),
      damageAttribute: new fields.StringField({required: true, nullable: false, initial: "strength"}),
      rangeIncrement: new fields.NumberField({
        required: true, nullable: false, integer: true, initial: 0, min: 0
      }),
      maximumIncrements: new fields.NumberField({
        required: true, nullable: false, integer: true, initial: 0, min: 0
      }),
      ammunitionType: new fields.StringField({required: true, nullable: false, initial: ""}),
      resource: new fields.SchemaField({
        value: new fields.NumberField({
          required: true, nullable: false, integer: true, initial: 0, min: 0
        }),
        max: new fields.NumberField({
          required: true, nullable: false, integer: true, initial: 0, min: 0
        }),
        unit: new fields.StringField({required: true, nullable: false, initial: ""})
      }),
      packageId: new fields.StringField({required: true, nullable: false, initial: ""}),
      packageRole: new fields.StringField({required: true, nullable: false, initial: ""}),
      notes: new fields.HTMLField({required: true, nullable: false, initial: ""})
    };
  }
}

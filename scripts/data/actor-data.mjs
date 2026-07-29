const fields = foundry.data.fields;

export class AetherchromeActorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      concept: new fields.StringField({
        required: true,
        nullable: false,
        initial: ""
      }),
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

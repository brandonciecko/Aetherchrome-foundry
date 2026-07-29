const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class AetherchromeItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["aetherchrome", "item-sheet"],
    position: {width: 620, height: 720},
    form: {closeOnSubmit: false}
  };

  static PARTS = {
    form: {template: "systems/aetherchrome/templates/item/item-sheet.hbs"}
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const type = this.item.type;

    return foundry.utils.mergeObject(context, {
      item: this.item,
      system: this.item.system,
      editable: this.isEditable,
      typeLabel: type.charAt(0).toUpperCase() + type.slice(1),
      isWeapon: type === "weapon",
      isArmor: type === "armor",
      isShield: type === "shield",
      isGear: type === "gear",
      isAmmunition: type === "ammunition",
      isPackage: type === "package",
      hasResource: ["gear", "ammunition"].includes(type)
    }, {inplace: false});
  }
}

function item({
  id,
  name,
  type,
  version,
  category,
  description,
  tags = "",
  rating = 0,
  load = 0,
  quantity = 1,
  ready = false,
  worn = false,
  carryLocation = "",
  wearLocation = "",
  grip = "",
  configuration = "",
  coverage = "",
  damageAttribute = "strength",
  rangeIncrement = 0,
  maximumIncrements = 0,
  ammunitionType = "",
  resourceValue = 0,
  resourceMax = 0,
  resourceUnit = "",
  notes = ""
}) {
  return {
    name,
    type,
    system: {
      registryId: id,
      recordVersion: version,
      recordStatus: "PROVISIONAL",
      primaryCategory: category,
      tags,
      description,
      itemRating: rating,
      quantity,
      load,
      ready,
      worn,
      carryLocation,
      wearLocation,
      grip,
      configuration,
      coverage,
      damageAttribute,
      rangeIncrement,
      maximumIncrements,
      ammunitionType,
      resource: {
        value: resourceValue,
        max: resourceMax,
        unit: resourceUnit
      },
      packageId: "",
      packageRole: "",
      notes
    }
  };
}

export const ALPHA_ITEMS = {
  "ITM-WPN-ARMING-SWORD-001": item({
    id: "ITM-WPN-ARMING-SWORD-001",
    name: "Arming Sword",
    type: "weapon",
    version: "v0.1-r5",
    category: "Weapon",
    description: "One-handed straight, double-edged sword intended for close combat and shield-compatible use.",
    tags: "Parry",
    rating: 2,
    load: 1,
    grip: "One-handed",
    notes: "Reach 1. Strictly one-handed. Item Rating 2 supplies two base Damage Pool dice and modifies Basic Parry Effective Skill."
  }),
  "ITM-WPN-DAGGER-001": item({
    id: "ITM-WPN-DAGGER-001",
    name: "Dagger",
    type: "weapon",
    version: "v0.1-r3",
    category: "Weapon",
    description: "Short, double-edged fighting knife intended for close combat, utility cutting, and thrusting.",
    tags: "Parry; Light",
    rating: 1,
    load: 1,
    grip: "One-handed",
    notes: "Reach 1. Knives or Swords may be used for its Attack Task; ratings do not combine."
  }),
  "ITM-WPN-GREATSWORD-001": item({
    id: "ITM-WPN-GREATSWORD-001",
    name: "Greatsword",
    type: "weapon",
    version: "v0.1-r4",
    category: "Weapon",
    description: "Two-handed great sword intended for powerful cuts, thrusts, broad defensive control, and extended reach.",
    tags: "Parry; Heavy",
    rating: 3,
    load: 2,
    grip: "Two-handed",
    notes: "Reach 2. Ordinary use contributes Item Rating 3 plus the separate +1 two-handed sword damage-pool modifier."
  }),
  "ITM-WPN-LONGSWORD-001": item({
    id: "ITM-WPN-LONGSWORD-001",
    name: "Longsword",
    type: "weapon",
    version: "v0.1-r2",
    category: "Weapon",
    description: "Versatile straight, double-edged sword with an extended grip.",
    tags: "Parry",
    rating: 2,
    load: 1,
    grip: "One- or two-handed",
    notes: "Reach 1. Two-handed use adds the separate +1 sword damage-pool modifier."
  }),
  "ITM-WPN-LONGBOW-001": item({
    id: "ITM-WPN-LONGBOW-001",
    name: "Longbow",
    type: "weapon",
    version: "v0.1-r2",
    category: "Weapon",
    description: "Tall, powerful bow intended for greater projectile force and range.",
    rating: 2,
    load: 3,
    grip: "Two-handed",
    damageAttribute: "strength",
    rangeIncrement: 20,
    maximumIncrements: 5,
    ammunitionType: "arrow",
    resourceValue: 0,
    resourceMax: 1,
    resourceUnit: "loaded arrow",
    notes: "Arrow ammunition. Range Increment 20 hexes; maximum 5 increments. Capacity 1; Reload loads one arrow and Draw Bow applies Ready."
  }),
  "ITM-ARM-TORSO-PADDED-001": item({
    id: "ITM-ARM-TORSO-PADDED-001",
    name: "Padded Torso Armor",
    type: "armor",
    version: "v0.1-r2",
    category: "Armor / Protective",
    description: "Quilted textile torso armor formed from multiple fabric layers with internal padding.",
    tags: "Armor; Torso; Padded",
    rating: 1,
    load: 2,
    worn: true,
    wearLocation: "Torso",
    coverage: "Torso",
    notes: "Provides persistent Armor 1 at the Torso while properly worn."
  }),
  "ITM-ARM-HEAVY-PLATE-001": item({
    id: "ITM-ARM-HEAVY-PLATE-001",
    name: "Heavy Plate Armor",
    type: "armor",
    version: "v0.1",
    category: "Armor / Protective",
    description: "Articulated steel plate harness over textile and leather support.",
    tags: "Armor; Plate; Heavy; Noisy",
    rating: 3,
    load: 10,
    worn: true,
    wearLocation: "Torso, Arms, Legs",
    coverage: "Torso; Left Arm; Right Arm; Left Leg; Right Leg",
    notes: "Provides persistent Armor 3 at covered locations while properly worn."
  }),
  "ITM-SHD-LARGE-001": item({
    id: "ITM-SHD-LARGE-001",
    name: "Large Shield",
    type: "shield",
    version: "v0.1-r2",
    category: "Armor / Protective",
    description: "Large arm-strapped defensive shield intended for personal Shield Block use.",
    tags: "Heavy",
    rating: 2,
    load: 3,
    grip: "Arm-strapped",
    configuration: "Full-body directional coverage",
    coverage: "Full body in eligible directions",
    notes: "Item Rating 2 modifies Effective Block Skill. It grants no passive Armor."
  }),
  "ITM-SHD-SMALL-001": item({
    id: "ITM-SHD-SMALL-001",
    name: "Small Shield",
    type: "shield",
    version: "v0.1-r2",
    category: "Armor / Protective",
    description: "Small arm-strapped defensive shield intended for personal Shield Block use.",
    rating: 1,
    load: 1,
    grip: "Arm-strapped",
    configuration: "Upper-body",
    coverage: "Torso; Head; Arms",
    notes: "May use upper- or lower-body configuration. Item Rating 1 modifies Effective Block Skill."
  }),
  "ITM-CON-QUIVER-001": item({
    id: "ITM-CON-QUIVER-001",
    name: "Quiver",
    type: "gear",
    version: "v0.1",
    category: "Containers and load-bearing equipment",
    description: "Wearable arrow container designed for rapid access to bow ammunition.",
    tags: "Consumable",
    load: 1,
    worn: true,
    resourceValue: 20,
    resourceMax: 20,
    resourceUnit: "arrows",
    notes: "Capacity 20 compatible arrows. Episode refresh restores a legal allocation up to capacity."
  }),
  "ITM-AMMO-ARROW-TRAINING-001": item({
    id: "ITM-AMMO-ARROW-TRAINING-001",
    name: "Training Arrow",
    type: "ammunition",
    version: "v0.1",
    category: "Ammunition, fuel, and power supplies",
    description: "Simple wooden-shaft arrow with feather fletching and no specialized arrowhead.",
    tags: "Consumable; Aggregate Load",
    rating: 0,
    load: 0.05,
    quantity: 20,
    resourceValue: 20,
    resourceMax: 20,
    resourceUnit: "arrows",
    notes: "Canonical base arrow item. Twenty arrows contribute Aggregate Load 1 in the Alpha package."
  })
};

function cloneItem(id, overrides = {}) {
  const base = foundry.utils.deepClone(ALPHA_ITEMS[id]);
  base.system = foundry.utils.mergeObject(base.system, overrides, {inplace: false});
  return base;
}

export const ALPHA_PACKAGES = [
  {
    id: "PKG-A01-SENTINEL",
    name: "Sentinel",
    role: "Maximum protection",
    totalLoad: 15,
    items: [
      cloneItem("ITM-ARM-HEAVY-PLATE-001"),
      cloneItem("ITM-SHD-LARGE-001", {carryLocation: "Shield arm", ready: false}),
      cloneItem("ITM-WPN-ARMING-SWORD-001", {carryLocation: "Recorded weapon carry location", ready: false}),
      cloneItem("ITM-WPN-DAGGER-001", {carryLocation: "Recorded carry location", ready: false})
    ]
  },
  {
    id: "PKG-A01-SHIELDBEARER",
    name: "Shieldbearer",
    role: "Balanced defense",
    totalLoad: 7,
    items: [
      cloneItem("ITM-ARM-TORSO-PADDED-001"),
      cloneItem("ITM-SHD-LARGE-001", {carryLocation: "Shield arm", ready: false}),
      cloneItem("ITM-WPN-ARMING-SWORD-001", {carryLocation: "Recorded weapon carry location", ready: false}),
      cloneItem("ITM-WPN-DAGGER-001", {carryLocation: "Recorded carry location", ready: false})
    ]
  },
  {
    id: "PKG-A01-VANGUARD",
    name: "Vanguard",
    role: "Mobile defense",
    totalLoad: 5,
    items: [
      cloneItem("ITM-ARM-TORSO-PADDED-001"),
      cloneItem("ITM-SHD-SMALL-001", {carryLocation: "Shield arm", configuration: "Upper-body", ready: false}),
      cloneItem("ITM-WPN-LONGSWORD-001", {carryLocation: "Recorded weapon carry location", ready: false}),
      cloneItem("ITM-WPN-DAGGER-001", {carryLocation: "Recorded carry location", ready: false})
    ]
  },
  {
    id: "PKG-A01-BREAKER",
    name: "Breaker",
    role: "Reach and damage",
    totalLoad: 5,
    items: [
      cloneItem("ITM-ARM-TORSO-PADDED-001"),
      cloneItem("ITM-WPN-GREATSWORD-001", {carryLocation: "Recorded weapon carry location", ready: false}),
      cloneItem("ITM-WPN-DAGGER-001", {carryLocation: "Recorded carry location", ready: false})
    ]
  },
  {
    id: "PKG-A01-MARKSMAN",
    name: "Marksman",
    role: "Ranged combat",
    totalLoad: 6,
    items: [
      cloneItem("ITM-WPN-LONGBOW-001", {carryLocation: "Recorded weapon carry location", ready: false}),
      cloneItem("ITM-CON-QUIVER-001", {carryLocation: "Recorded worn carry location", worn: true}),
      cloneItem("ITM-AMMO-ARROW-TRAINING-001", {quantity: 20, resource: {value: 20, max: 20, unit: "arrows"}}),
      cloneItem("ITM-WPN-DAGGER-001", {carryLocation: "Recorded carry location", ready: false})
    ]
  }
];

export function alphaPackageById(id) {
  return ALPHA_PACKAGES.find(entry => entry.id === id) ?? null;
}

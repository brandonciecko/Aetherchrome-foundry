import { AetherchromeActorData } from "./data/actor-data.mjs";
import { AetherchromeItemData } from "./data/item-data.mjs";
import { AetherchromeActorSheet } from "./sheets/actor-sheet.mjs";
import { AetherchromeItemSheet } from "./sheets/item-sheet.mjs";

Hooks.once("init", () => {
  console.log("Aetherchrome | Initializing");

  CONFIG.Actor.dataModels = {
    actor: AetherchromeActorData
  };

  CONFIG.Item.dataModels = {
    weapon: AetherchromeItemData,
    armor: AetherchromeItemData,
    shield: AetherchromeItemData,
    gear: AetherchromeItemData,
    ammunition: AetherchromeItemData,
    package: AetherchromeItemData
  };

  CONFIG.Actor.trackableAttributes = {
    actor: {
      bar: ["resources.health"],
      value: []
    }
  };

  const { DocumentSheetConfig } = foundry.applications.apps;
  DocumentSheetConfig.registerSheet(Actor, "aetherchrome", AetherchromeActorSheet, {
    types: ["actor"],
    makeDefault: true,
    label: "AETHERCHROME.ActorSheet"
  });

  DocumentSheetConfig.registerSheet(Item, "aetherchrome", AetherchromeItemSheet, {
    types: ["weapon", "armor", "shield", "gear", "ammunition", "package"],
    makeDefault: true,
    label: "AETHERCHROME.ItemSheet"
  });
});

Hooks.once("ready", () => {
  console.log("Aetherchrome | Ready");
  ui.notifications.info(`Aetherchrome v${game.system.version} loaded.`);
});

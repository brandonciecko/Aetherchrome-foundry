import { AetherchromeActorData } from "./data/actor-data.mjs";
import { AetherchromeActorSheet } from "./sheets/actor-sheet.mjs";

Hooks.once("init", () => {
  console.log("Aetherchrome | Initializing v0.0.1");

  CONFIG.Actor.dataModels = {
    actor: AetherchromeActorData
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
});

Hooks.once("ready", () => {
  console.log("Aetherchrome | Ready");
  ui.notifications.info("Aetherchrome v0.0.1 loaded.");
});

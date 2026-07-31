import { AetherchromeActorData } from "./data/actor-data.mjs";
import { AetherchromeItemData } from "./data/item-data.mjs";
import { AetherchromeActorSheet } from "./sheets/actor-sheet.mjs";
import { AetherchromeItemSheet } from "./sheets/item-sheet.mjs";
import { AetherchromeCampaignRegistry } from "./core/campaign-registry.mjs";
import { AetherchromeCampaignService } from "./core/campaign-service.mjs";
import { ALPHA_01_PROFILE } from "./campaigns/alpha-01/index.mjs";

Hooks.once("init", () => {
  console.log("Aetherchrome | Initializing");

  const campaignRegistry = new AetherchromeCampaignRegistry();
  campaignRegistry.register(ALPHA_01_PROFILE);

  game.aetherchrome = {
    campaignRegistry,
    campaign: new AetherchromeCampaignService(campaignRegistry)
  };

  game.settings.register("aetherchrome", "campaignProfile", {
    name: "Campaign Profile",
    hint: "Select the active Aetherchrome campaign configuration for this world.",
    scope: "world",
    config: true,
    type: String,
    choices: campaignRegistry.choices(),
    default: "alpha-01",
    requiresReload: true
  });

  CONFIG.Actor.dataModels = {
    actor: AetherchromeActorData
  };

  CONFIG.Item.dataModels = {
    weapon: AetherchromeItemData,
    armor: AetherchromeItemData,
    shield: AetherchromeItemData,
    gear: AetherchromeItemData,
    ammunition: AetherchromeItemData,
    package: AetherchromeItemData,
    trait: AetherchromeItemData
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
    types: ["weapon", "armor", "shield", "gear", "ammunition", "package", "trait"],
    makeDefault: true,
    label: "AETHERCHROME.ItemSheet"
  });
});

Hooks.once("ready", () => {
  console.log("Aetherchrome | Ready");
  ui.notifications.info(
    `Aetherchrome v${game.system.version} loaded — ${game.aetherchrome.campaign.name}.`
  );
});

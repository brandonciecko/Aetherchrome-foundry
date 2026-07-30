export class AetherchromeCampaignService {
  constructor(registry) {
    this.registry = registry;
  }

  get activeId() {
    return game.settings.get("aetherchrome", "campaignProfile");
  }

  get profile() {
    return this.registry.get(this.activeId) ?? this.registry.list()[0] ?? null;
  }

  get name() {
    return this.profile?.name ?? "Unconfigured Campaign";
  }

  getAvailableSkillIds() {
    return [...(this.profile?.availability?.skills ?? [])];
  }

  getAvailableTraitIds() {
    return [...(this.profile?.availability?.traits ?? [])];
  }

  getAvailableItemIds() {
    return [...(this.profile?.availability?.items ?? [])];
  }

  getEquipmentPackages() {
    return foundry.utils.deepClone(this.profile?.equipmentPackages ?? []);
  }

  getRuleOption(key, fallback = null) {
    return this.profile?.configuration?.[key] ?? fallback;
  }

  getModuleId(slot) {
    return this.profile?.modules?.[slot] ?? null;
  }

  getExceptions() {
    return foundry.utils.deepClone(this.profile?.exceptions ?? []);
  }

  isAvailable(type, id) {
    const sets = {
      skill: this.getAvailableSkillIds(),
      trait: this.getAvailableTraitIds(),
      item: this.getAvailableItemIds()
    };
    return (sets[String(type).toLowerCase()] ?? []).includes(id);
  }
}

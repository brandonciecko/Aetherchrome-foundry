export class AetherchromeCampaignRegistry {
  #profiles = new Map();

  register(profile) {
    if (!profile?.id) throw new Error("Campaign profiles require a stable id.");
    if (this.#profiles.has(profile.id)) {
      throw new Error(`Campaign profile already registered: ${profile.id}`);
    }
    const normalized = foundry.utils.deepFreeze(foundry.utils.deepClone(profile));
    this.#profiles.set(normalized.id, normalized);
    return normalized;
  }

  get(id) {
    return this.#profiles.get(id) ?? null;
  }

  list() {
    return Array.from(this.#profiles.values());
  }

  choices() {
    return Object.fromEntries(this.list().map(profile => [profile.id, profile.name]));
  }
}

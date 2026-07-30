import { SKILL_CATALOG, TASK_CATALOG } from "../catalogs/skill-catalog.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin, DialogV2 } = foundry.applications.api;

const ATTRIBUTE_DEFINITIONS = [
  { key: "strength", label: "Strength", abbreviation: "STR" },
  { key: "health", label: "Health", abbreviation: "HLT" },
  { key: "intelligence", label: "Intelligence", abbreviation: "INT" },
  { key: "agility", label: "Agility", abbreviation: "AGL" },
  { key: "charisma", label: "Charisma", abbreviation: "CHA" },
  { key: "essence", label: "Essence", abbreviation: "ESS" }
];


function dataKey(skillId) {
  return skillId.toLowerCase().replace("skl-", "").replaceAll("-", "_");
}

function buildTree(actor, availableSkillIds, availableTaskIds) {
  const byParent = new Map();
  for (const skill of SKILL_CATALOG.filter(entry => availableSkillIds.has(entry.id))) {
    const parent = skill.parentId ?? "ROOT";
    const children = byParent.get(parent) ?? [];
    children.push(skill);
    byParent.set(parent, children);
  }

  const buildNode = (skill, depth = 0) => {
    const key = dataKey(skill.id);
    const record = actor.system.skillTree[key];
    const tasks = TASK_CATALOG
      .filter(task => task.skillId === skill.id && availableTaskIds.has(task.id))
      .map(task => ({...task, selected: task.id === record.selectedTask}));

    return {
      ...skill,
      key,
      depth,
      indent: depth * 18,
      rating: record.rating,
      selectedTask: record.selectedTask,
      tasks,
      hasTasks: tasks.length > 0,
      children: (byParent.get(skill.id) ?? []).map(child => buildNode(child, depth + 1))
    };
  };

  return (byParent.get("ROOT") ?? []).map(skill => buildNode(skill));
}

function flattenTree(nodes) {
  const rows = [];
  for (const node of nodes) {
    rows.push(node);
    rows.push(...flattenTree(node.children));
  }
  return rows;
}

function chanceThreshold(attribute) {
  if (attribute <= 3) return 1;
  if (attribute <= 6) return 2;
  return 3;
}

function signedNumber(value) {
  const number = Number(value) || 0;
  return number > 0 ? `+${number}` : `${number}`;
}

export class AetherchromeActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  #editMode = false;
  #savedScrollTop = 0;
  #pendingTaskFocus = "";

  static DEFAULT_OPTIONS = {
    classes: ["aetherchrome", "actor-sheet"],
    position: {
      width: 980,
      height: 820
    },
    form: {
      closeOnSubmit: false,
      submitOnChange: true
    },
    actions: {
      toggleEditMode: AetherchromeActorSheet.#onToggleEditMode,
      editPortrait: AetherchromeActorSheet.#onEditPortrait,
      taskDetails: AetherchromeActorSheet.#onTaskDetails,
      skillDetails: AetherchromeActorSheet.#onSkillDetails,
      taskSearchSelect: AetherchromeActorSheet.#onTaskSearchSelect,
      pressureDecrease: AetherchromeActorSheet.#onPressureDecrease,
      pressureIncrease: AetherchromeActorSheet.#onPressureIncrease,
      hpDecrease: AetherchromeActorSheet.#onHpDecrease,
      hpIncrease: AetherchromeActorSheet.#onHpIncrease,
      mpDecrease: AetherchromeActorSheet.#onMpDecrease,
      mpIncrease: AetherchromeActorSheet.#onMpIncrease,
      openEffortDialog: AetherchromeActorSheet.#onOpenEffortDialog,
      toggleSkillBranch: AetherchromeActorSheet.#onToggleSkillBranch,
      expandAllSkills: AetherchromeActorSheet.#onExpandAllSkills,
      collapseAllSkills: AetherchromeActorSheet.#onCollapseAllSkills,
      itemEdit: AetherchromeActorSheet.#onItemEdit,
      itemDelete: AetherchromeActorSheet.#onItemDelete,
      itemReadyToggle: AetherchromeActorSheet.#onItemReadyToggle,
      itemQuantityDecrease: AetherchromeActorSheet.#onItemQuantityDecrease,
      itemQuantityIncrease: AetherchromeActorSheet.#onItemQuantityIncrease,
      itemResourceDecrease: AetherchromeActorSheet.#onItemResourceDecrease,
      itemResourceIncrease: AetherchromeActorSheet.#onItemResourceIncrease,
      weaponAttack: AetherchromeActorSheet.#onWeaponAttack,
      weaponReload: AetherchromeActorSheet.#onWeaponReload,
      applyEquipmentPackage: AetherchromeActorSheet.#onApplyEquipmentPackage
    }
  };

  static PARTS = {
    form: { template: "systems/aetherchrome/templates/actor/actor-sheet.hbs" }
  };

  async _prepareContext(options) {
    await this.#normalizeDerivedResources();
    const context = await super._prepareContext(options);
    const expansion = await this.#getSkillExpansion();
    const availableSkillIds = new Set(game.aetherchrome.campaign.getAvailableSkillIds());
    const availableTaskIds = new Set(game.aetherchrome.campaign.getAvailableTaskIds());
    const allRows = flattenTree(buildTree(this.actor, availableSkillIds, availableTaskIds));
    const hiddenDepths = [];

    const skillRows = allRows.map(row => {
      while (hiddenDepths.length && hiddenDepths.at(-1) >= row.depth) hiddenDepths.pop();
      const hidden = hiddenDepths.length > 0;
      const hasChildren = row.children.length > 0;
      const expanded = hasChildren && expansion.has(row.id);

      if (hasChildren && !expanded) hiddenDepths.push(row.depth);

      const parent = row.parentId
        ? SKILL_CATALOG.find(skill => skill.id === row.parentId)
        : null;
      const parentRating = parent
        ? Number(this.actor.system.skillTree[dataKey(parent.id)]?.rating ?? 0)
        : 10;

      return {
        ...row,
        hasChildren,
        expanded,
        hidden,
        parentName: parent?.name ?? "",
        parentRating,
        maxRating: parent ? parentRating : 10,
        briefDescription: `${row.recordType}; typical Attribute ${row.primaryAttribute}.`,
        taskCount: row.tasks.length
      };
    });

    const taskSearchOptions = TASK_CATALOG
      .filter(task => availableTaskIds.has(task.id))
      .map(task => {
        const skill = SKILL_CATALOG.find(entry => entry.id === task.skillId);
        return {
          id: task.id,
          name: task.name,
          skillId: task.skillId,
          skillName: skill?.name ?? task.skillId,
          label: `${task.name} — ${skill?.name ?? task.skillId}`
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));

    const inventory = this.actor.items.map(item => {
        const quantity = Math.max(0, Number(item.system.quantity ?? 1));
        const resourceMax = Math.max(0, Number(item.system.resource?.max ?? 0));
        const resourceValue = Math.max(0, Number(item.system.resource?.value ?? 0));
        return {
          id: item.id,
          name: item.name,
          img: item.img,
          type: item.type,
          typeLabel: item.type.charAt(0).toUpperCase() + item.type.slice(1),
          registryId: item.system.registryId,
          quantity,
          load: Number(item.system.load ?? 0),
          aggregateLoad: Number(item.system.load ?? 0) * quantity,
          ready: Boolean(item.system.ready),
          worn: Boolean(item.system.worn),
          carryLocation: item.system.wearLocation || item.system.carryLocation || "—",
          configuration: item.system.configuration || item.system.grip || "—",
          hasResource: resourceMax > 0,
          resourceValue,
          resourceMax,
          resourceUnit: item.system.resource?.unit || "",
          isWeapon: item.type === "weapon",
          canReload: item.type === "weapon" && resourceMax > 0 && Boolean(item.system.ammunitionType),
          itemRating: Number(item.system.itemRating ?? 0)
        };      });
    const totalLoad = inventory.reduce((total, item) => total + item.aggregateLoad, 0);
    const currentStrength = Math.max(
      0,
      Number(this.actor.system.attributes?.strength?.current ?? 0)
    );
    const encumbrance = AetherchromeActorSheet.#encumbranceFrom(totalLoad, currentStrength);

        return foundry.utils.mergeObject(context, {
      actor: this.actor,
      system: this.actor.system,
      editable: this.isEditable,
      editMode: this.#editMode,
      portraitEditable: this.isEditable && this.#editMode,
      systemVersion: game.system.version,
      attributes: ATTRIBUTE_DEFINITIONS.map(definition => ({
        ...definition,
        label: `AETHERCHROME.Attribute${definition.label}`,
        value: this.actor.system.attributes[definition.key]
      })),
      skillRows,
      pressureAtMinimum: Number(this.actor.system.resources.pressure ?? 0) <= 0,
      pressureAtMaximum: Number(this.actor.system.resources.pressure ?? 0) >= 4,
      hp: this.#resourceContext("health"),
      mp: this.#resourceContext("magic"),
      openSkillEffortPending: Boolean(this.actor.system.resources.effort?.openSkill),
      activeDefenseEffortPending: Boolean(this.actor.system.resources.effort?.activeDefense),
      campaign: {
        id: game.aetherchrome.campaign.activeId,
        name: game.aetherchrome.campaign.name,
        version: game.aetherchrome.campaign.profile?.version ?? ""
      },
      equipmentPackages: game.aetherchrome.campaign.getEquipmentPackages().map(entry => ({
        ...entry,
        selected: entry.id === this.actor.system.equipment?.packageId
      })),
      inventory,
      totalLoad,
      encumbrance: {
        ...encumbrance,
        effectiveStrength: currentStrength,
        display: `${encumbrance.category} - EP ${encumbrance.penalty}`
      },
      statuses: []
    }, { inplace: false });
  }

  #resourceContext(resourceKey) {
    const isHealth = resourceKey === "health";
    const attributeKey = isHealth ? "health" : "essence";
    const maximum = Math.max(0, Number(this.actor.system.attributes[attributeKey]?.base ?? 0));
    const storedValue = Number(this.actor.system.resources[resourceKey]?.value ?? maximum);
    const minimum = isHealth ? -5 * maximum : null;
    const value = isHealth
      ? Math.max(minimum, Math.min(maximum, storedValue))
      : Math.min(maximum, storedValue);

    let state = "normal";
    let threshold = null;

    if (isHealth) {
      if (value <= 0) {
        state = "danger";
        threshold = 0;
      }
      if (maximum > 0 && value < -maximum) {
        const interval = Math.floor((Math.abs(value) - 1) / maximum);
        state = "critical";
        threshold = interval;
      }
    } else if (value < 0) {
      state = "warning";
      threshold = 0;
    }

    return {
      value,
      maximum,
      minimum,
      state,
      threshold,
      atMinimum: minimum !== null && value <= minimum,
      atMaximum: value >= maximum
    };
  }

  async #normalizeDerivedResources() {
    const hp = this.#resourceContext("health");
    const mp = this.#resourceContext("magic");
    const update = {};

    if (Number(this.actor.system.resources.health?.max ?? -1) !== hp.maximum) {
      update["system.resources.health.max"] = hp.maximum;
    }
    if (Number(this.actor.system.resources.magic?.max ?? -1) !== mp.maximum) {
      update["system.resources.magic.max"] = mp.maximum;
    }
    if (Number(this.actor.system.resources.health?.value ?? hp.maximum) !== hp.value) {
      update["system.resources.health.value"] = hp.value;
    }
    if (Number(this.actor.system.resources.magic?.value ?? mp.maximum) !== mp.value) {
      update["system.resources.magic.value"] = mp.value;
    }

    if (Object.keys(update).length) await this.actor.update(update);
  }

  async #getSkillExpansion() {
    const stored = await game.user.getFlag("aetherchrome", "skillTreeExpansion") ?? {};
    const actorExpansion = stored[this.actor.id];

    if (Array.isArray(actorExpansion)) return new Set(actorExpansion);

    return new Set();
  }

  async #setSkillExpansion(expansion) {
    const stored = foundry.utils.deepClone(
      await game.user.getFlag("aetherchrome", "skillTreeExpansion") ?? {}
    );
    stored[this.actor.id] = [...expansion];
    await game.user.setFlag("aetherchrome", "skillTreeExpansion", stored);
  }

  _onRender(context, options) {
    super._onRender(context, options);

    this.element
      ?.querySelectorAll('input[data-skill-id]')
      .forEach(input => {
        input.addEventListener("change", async event => {
          event.preventDefault();
          event.stopImmediatePropagation();
          await this.#persistSkillRating(event.currentTarget);
        }, {capture: true});
      });
  }

  async #persistSkillRating(input) {
    const skillId = String(input.dataset.skillId ?? "");
    const skill = SKILL_CATALOG.find(entry => entry.id === skillId);
    if (!skill) return;

    const requested = Math.max(0, Math.min(10, Math.trunc(Number(input.value) || 0)));
    const parent = skill.parentId
      ? SKILL_CATALOG.find(entry => entry.id === skill.parentId)
      : null;
    const parentRating = parent
      ? Number(this.actor.system.skillTree[dataKey(parent.id)]?.rating ?? 0)
      : 10;
    const legalRating = Math.min(requested, parentRating);
    const updates = {
      [`system.skillTree.${dataKey(skill.id)}.rating`]: legalRating
    };
    const loweredDescendants = [];

    const descendants = SKILL_CATALOG.filter(entry => {
      let cursor = entry;
      while (cursor?.parentId) {
        if (cursor.parentId === skill.id) return true;
        cursor = SKILL_CATALOG.find(candidate => candidate.id === cursor.parentId);
      }
      return false;
    });

    const proposedRatings = new Map(
      SKILL_CATALOG.map(entry => [
        entry.id,
        entry.id === skill.id
          ? legalRating
          : Number(this.actor.system.skillTree[dataKey(entry.id)]?.rating ?? 0)
      ])
    );

    const ordered = descendants.sort((a, b) => {
      const depth = entry => {
        let value = 0;
        let cursor = entry;
        while (cursor?.parentId) {
          value += 1;
          cursor = SKILL_CATALOG.find(candidate => candidate.id === cursor.parentId);
        }
        return value;
      };
      return depth(a) - depth(b);
    });

    for (const descendant of ordered) {
      const current = proposedRatings.get(descendant.id) ?? 0;
      const limit = proposedRatings.get(descendant.parentId) ?? 0;
      if (current > limit) {
        proposedRatings.set(descendant.id, limit);
        updates[`system.skillTree.${dataKey(descendant.id)}.rating`] = limit;
        loweredDescendants.push(`${descendant.name} ${current}→${limit}`);
      }
    }

    input.value = String(legalRating);
    await this.actor.update(updates);

    if (requested > legalRating && parent) {
      ui.notifications.warn(
        `${skill.name} cannot exceed parent Skill ${parent.name} ${parentRating}.`
      );
    }
    if (loweredDescendants.length) {
      ui.notifications.warn(
        `Lowering ${skill.name} also adjusted: ${loweredDescendants.join(", ")}.`
      );
    }
  }

  static async #onEditPortrait(event) {
    event.preventDefault();

    if (!this.#editMode) {
      ui.notifications.warn("Enable Actor Edit mode before changing the portrait.");
      return;
    }

    if (!this.actor.isOwner && !game.user.isGM) {
      ui.notifications.warn(`You do not have permission to edit ${this.actor.name}.`);
      return;
    }

    const picker = new FilePicker({
      type: "image",
      current: this.actor.img,
      callback: async path => {
        if (!path) return;
        await this.actor.update({img: path});

        for (const token of this.actor.getActiveTokens?.(true, true) ?? []) {
          if (token.document?.actorLink) {
            await token.document.update({"texture.src": path});
          }
        }

        await this.render();
      }
    });

    picker.render(true);
  }

  static async #onToggleEditMode(event) {
    event.preventDefault();

    const leavingEditMode = this.#editMode;
    if (leavingEditMode) {
      const updates = {};
      const form = this.element?.querySelector("form");

      for (const attribute of ATTRIBUTE_DEFINITIONS) {
        const input = form?.querySelector(
          `[name="system.attributes.${attribute.key}.base"]`
        );
        const base = Math.max(
          1,
          Math.min(
            9,
            Math.trunc(Number(input?.value ?? this.actor.system.attributes?.[attribute.key]?.base ?? 1))
          )
        );
        updates[`system.attributes.${attribute.key}.base`] = base;
        updates[`system.attributes.${attribute.key}.current`] = base;
      }

      const baseHealth = updates["system.attributes.health.base"];
      const baseEssence = updates["system.attributes.essence.base"];
      const hpCurrent = Number(this.actor.system.resources?.health?.value ?? baseHealth);
      const mpCurrent = Number(this.actor.system.resources?.magic?.value ?? baseEssence);

      updates["system.resources.health.max"] = baseHealth;
      updates["system.resources.health.value"] = Math.min(hpCurrent, baseHealth);
      updates["system.resources.magic.max"] = baseEssence;
      updates["system.resources.magic.value"] = Math.min(mpCurrent, baseEssence);

      await this.actor.update(updates);
      this.#editMode = false;
      ui.notifications.info(
        "Actor Edit mode disabled. Base Attributes were saved and derived values synchronized."
      );
    } else {
      this.#editMode = true;
      ui.notifications.info(
        "Actor Edit mode enabled. Base Attributes and portrait can now be changed."
      );
    }

    await this.#renderPreservingScroll();
  }

  #captureScroll() {
    const form = this.element?.querySelector("form");
    this.#savedScrollTop = form?.scrollTop ?? 0;
  }

  async #renderPreservingScroll() {
    this.#captureScroll();
    await this.render();
  }

  _onRender(context, options) {
    super._onRender(context, options);
    const form = this.element?.querySelector("form");
    if (form) {
      requestAnimationFrame(() => {
        form.scrollTop = this.#savedScrollTop;
        if (this.#pendingTaskFocus) {
          const row = this.element?.querySelector(
            `[data-skill-row-id="${CSS.escape(this.#pendingTaskFocus)}"]`
          );
          row?.scrollIntoView({block: "center", behavior: "smooth"});
          row?.classList.add("aec-focus-flash");
          setTimeout(() => row?.classList.remove("aec-focus-flash"), 1800);
          this.#pendingTaskFocus = "";
        }
      });
    }
  }

  static async #adjustResource(sheet, resourceKey, delta) {
    const context = sheet.#resourceContext(resourceKey);
    const next = resourceKey === "health"
      ? Math.max(context.minimum, Math.min(context.maximum, context.value + delta))
      : Math.min(context.maximum, context.value + delta);
    await sheet.actor.update({[`system.resources.${resourceKey}.value`]: next});
  }

  static async #onHpDecrease(event) {
    event.preventDefault();
    await AetherchromeActorSheet.#adjustResource(this, "health", -1);
  }

  static async #onHpIncrease(event) {
    event.preventDefault();
    await AetherchromeActorSheet.#adjustResource(this, "health", 1);
  }

  static async #onMpDecrease(event) {
    event.preventDefault();
    await AetherchromeActorSheet.#adjustResource(this, "magic", -1);
  }

  static async #onMpIncrease(event) {
    event.preventDefault();
    await AetherchromeActorSheet.#adjustResource(this, "magic", 1);
  }

  static async #onOpenEffortDialog(event) {
    event.preventDefault();

    const effortState = this.actor.system.resources.effort ?? {};
    const pendingType = String(effortState.pendingType ?? "");
    const pendingCost = Math.max(0, Number(effortState.pendingCost ?? 0));
    const locked = Boolean(pendingType || effortState.openSkill || effortState.activeDefense);
    const disabled = locked ? "disabled" : "";

    const content = `
      <form class="aec-effort-dialog">
        <p><strong>Current MP:</strong> ${this.#resourceContext("magic").value}</p>
        <p><strong>Pending Effort:</strong> ${locked ? foundry.utils.escapeHTML(pendingType || "Pending") : "None"}</p>

        <fieldset>
          <legend>Open Skill Effort — 1 MP</legend>
          <p>Apply +1 Effective Skill to the next eligible Open Skill roll.</p>
          <button type="button" data-effort="openSkill" ${disabled}>Spend 1 MP</button>
        </fieldset>

        <fieldset>
          <legend>Active Defense Effort — 1 MP</legend>
          <p>Ignore Pressure penalties on the next eligible Active Defense.</p>
          <button type="button" data-effort="activeDefense" ${disabled}>Spend 1 MP</button>
        </fieldset>

        <fieldset>
          <legend>Specified-Cost Activation — Variable MP</legend>
          <label><span>Amount</span><input name="amount" type="number" min="1" step="1" value="1" ${disabled}></label>
          <label><span>Source or note</span><input name="note" type="text" value="" ${disabled}></label>
          <button type="button" data-effort="variable" ${disabled}>Spend MP</button>
        </fieldset>

        <button type="button" class="aec-effort-reset" data-effort-reset ${locked ? "" : "disabled"}>
          Reset Pending Effort${pendingCost ? ` and refund ${pendingCost} MP` : ""}
        </button>
      </form>
    `;

    await DialogV2.wait({
      window: { title: `${this.actor.name}: Effort` },
      content,
      buttons: [{action: "close", label: "Close", default: true}],
      render: (_event, dialog) => {
        const form = dialog.element.querySelector("form");

        form?.querySelector("[data-effort-reset]")?.addEventListener("click", async clickEvent => {
          clickEvent.preventDefault();
          const live = this.actor.system.resources.effort ?? {};
          const refund = Math.max(0, Number(live.pendingCost ?? 0));
          const confirmed = await DialogV2.confirm({
            window: {title: "Reset Pending Effort"},
            content: `<p>Clear pending Effort and refund <strong>${refund} MP</strong>?</p>`,
            yes: {label: "Reset and Refund"},
            no: {label: "Cancel"},
            modal: true
          });
          if (!confirmed) return;
          const max = Number(this.actor.system.resources.magic.max ?? 0);
          const current = Number(this.actor.system.resources.magic.value ?? 0);
          await this.actor.update({
            "system.resources.magic.value": Math.min(max, current + refund),
            "system.resources.effort.openSkill": false,
            "system.resources.effort.activeDefense": false,
            "system.resources.effort.pendingType": "",
            "system.resources.effort.pendingCost": 0
          });
          ui.notifications.info(`Pending Effort reset; ${refund} MP refunded.`);
          dialog.close();
        });

        form?.querySelectorAll("[data-effort]").forEach(button => {
          button.addEventListener("click", async clickEvent => {
            clickEvent.preventDefault();
            const liveEffort = this.actor.system.resources.effort ?? {};
            if (liveEffort.pendingType || liveEffort.openSkill || liveEffort.activeDefense) {
              ui.notifications.warn("Resolve a roll or reset pending Effort before spending more.");
              return;
            }

            const effort = button.dataset.effort;
            const live = this.#resourceContext("magic");
            let cost = 1;
            let note = "";
            if (effort === "variable") {
              cost = Math.max(1, Number(form.elements.amount.value) || 1);
              note = String(form.elements.note.value ?? "").trim();
            }

            const nextMp = live.value - cost;
            const label = effort === "openSkill"
              ? "Open Skill Effort"
              : effort === "activeDefense"
                ? "Active Defense Effort"
                : (note || "Specified-Cost Activation");

            const update = {
              "system.resources.magic.value": nextMp,
              "system.resources.effort.pendingType": label,
              "system.resources.effort.pendingCost": cost
            };
            if (effort === "openSkill") update["system.resources.effort.openSkill"] = true;
            if (effort === "activeDefense") update["system.resources.effort.activeDefense"] = true;

            await this.actor.update(update);
            ui.notifications.info(`${label}: spent ${cost} MP. Further Effort is locked until a roll or reset.`);
            dialog.close();
          });
        });
      },
      modal: true,
      rejectClose: false
    });
  }

  static async #onPressureDecrease(event) {
    event.preventDefault();
    const current = Math.max(0, Number(this.actor.system.resources.pressure ?? 0));
    await this.actor.update({"system.resources.pressure": Math.max(0, current - 1)});
  }

  static async #onPressureIncrease(event) {
    event.preventDefault();
    const current = Math.max(0, Number(this.actor.system.resources.pressure ?? 0));
    await this.actor.update({"system.resources.pressure": Math.min(4, current + 1)});
  }

  static async #onToggleSkillBranch(event, target) {
    event.preventDefault();
    const skillId = target.dataset.skillId;
    if (!skillId) return;

    const expansion = await this.#getSkillExpansion();
    if (expansion.has(skillId)) expansion.delete(skillId);
    else expansion.add(skillId);

    await this.#setSkillExpansion(expansion);
    await this.#renderPreservingScroll();
  }

  static async #onExpandAllSkills(event) {
    event.preventDefault();
    const expansion = new Set(
      SKILL_CATALOG
        .filter(skill => SKILL_CATALOG.some(candidate => candidate.parentId === skill.id))
        .map(skill => skill.id)
    );
    await this.#setSkillExpansion(expansion);
    await this.#renderPreservingScroll();
  }

  static async #onCollapseAllSkills(event) {
    event.preventDefault();
    await this.#setSkillExpansion(new Set());
    await this.#renderPreservingScroll();
  }

  static async #onSkillDetails(event, target) {
    event.preventDefault();
    const skill = SKILL_CATALOG.find(entry => entry.id === target.dataset.skillId);
    if (!skill) return;
    const parent = SKILL_CATALOG.find(entry => entry.id === skill.parentId);
    const tasks = TASK_CATALOG.filter(task => task.skillId === skill.id)
      .filter(task => game.aetherchrome.campaign.getAvailableTaskIds().includes(task.id));
    const taskHtml = tasks.length
      ? `<ul>${tasks.map(task => `<li><strong>${foundry.utils.escapeHTML(task.name)}</strong> — ${foundry.utils.escapeHTML(task.requirements || "No recorded requirements")}</li>`).join("")}</ul>`
      : "<p>No available registered Tasks.</p>";

    await DialogV2.wait({
      window: {title: `${skill.name}: Skill Details`},
      content: `
        <section class="aec-skill-details">
          <p><strong>Type:</strong> ${skill.recordType}</p>
          <p><strong>Parent:</strong> ${parent?.name ?? "None"}</p>
          <p><strong>Typical Attribute:</strong> ${skill.primaryAttribute}</p>
          <p><strong>Registered scope:</strong> This Skill currently operates through its available registered Tasks.</p>
          <h3>Available Tasks</h3>
          ${taskHtml}
        </section>`,
      buttons: [{action: "close", label: "Close", default: true}],
      modal: true,
      rejectClose: false
    });
  }

  static async #onTaskSearchSelect(event, target) {
    event.preventDefault();
    const taskId = target.value;
    const task = TASK_CATALOG.find(entry => entry.id === taskId);
    if (!task) return;

    const expansion = await this.#getSkillExpansion();
    let skill = SKILL_CATALOG.find(entry => entry.id === task.skillId);
    while (skill) {
      if (SKILL_CATALOG.some(candidate => candidate.parentId === skill.id)) {
        expansion.add(skill.id);
      }
      skill = SKILL_CATALOG.find(entry => entry.id === skill.parentId);
    }

    await this.#setSkillExpansion(expansion);
    this.#pendingTaskFocus = task.skillId;
    await this.render();
  }

  static #embeddedItem(sheet, target) {
    const itemId = target.dataset.itemId;
    return itemId ? sheet.actor.items.get(itemId) : null;
  }

  static async #onItemEdit(event, target) {
    event.preventDefault();
    const item = AetherchromeActorSheet.#embeddedItem(this, target);
    item?.sheet.render(true);
  }

  static async #onItemDelete(event, target) {
    event.preventDefault();
    const item = AetherchromeActorSheet.#embeddedItem(this, target);
    if (!item) return;

    const confirmed = await DialogV2.confirm({
      window: {title: "Remove Equipment"},
      content: `<p>Remove <strong>${foundry.utils.escapeHTML(item.name)}</strong> from ${foundry.utils.escapeHTML(this.actor.name)}?</p>`,
      yes: {label: "Remove"},
      no: {label: "Cancel"},
      modal: true
    });
    if (confirmed) await item.delete();
  }

  static async #onItemReadyToggle(event, target) {
    event.preventDefault();
    const item = AetherchromeActorSheet.#embeddedItem(this, target);
    if (!item) return;
    this.#captureScroll();
    await item.update({"system.ready": !Boolean(item.system.ready)});
  }

  static async #adjustItemQuantity(sheet, target, delta) {
    const item = AetherchromeActorSheet.#embeddedItem(sheet, target);
    if (!item) return;
    const current = Math.max(0, Number(item.system.quantity ?? 1));
    await item.update({"system.quantity": Math.max(0, current + delta)});
  }

  static async #onItemQuantityDecrease(event, target) {
    event.preventDefault();
    await AetherchromeActorSheet.#adjustItemQuantity(this, target, -1);
  }

  static async #onItemQuantityIncrease(event, target) {
    event.preventDefault();
    await AetherchromeActorSheet.#adjustItemQuantity(this, target, 1);
  }

  static async #adjustItemResource(sheet, target, delta) {
    const item = AetherchromeActorSheet.#embeddedItem(sheet, target);
    if (!item) return;
    const maximum = Math.max(0, Number(item.system.resource?.max ?? 0));
    const current = Math.max(0, Number(item.system.resource?.value ?? 0));
    await item.update({"system.resource.value": Math.max(0, Math.min(maximum, current + delta))});
  }

  static async #onItemResourceDecrease(event, target) {
    event.preventDefault();
    await AetherchromeActorSheet.#adjustItemResource(this, target, -1);
  }

  static async #onItemResourceIncrease(event, target) {
    event.preventDefault();
    await AetherchromeActorSheet.#adjustItemResource(this, target, 1);
  }

  static #getSingleTarget() {
    const targets = Array.from(game.user.targets ?? []);
    if (targets.length !== 1) return null;
    return targets[0];
  }

  static #torsoArmor(actor) {
    const armorSources = actor.items
      .filter(item => item.type === "armor" && item.system.worn)
      .filter(item => {
        const coverage = String(item.system.coverage ?? "").toLowerCase();
        return coverage.includes("torso") || coverage.includes("body") || coverage.includes("all");
      })
      .map(item => ({
        name: item.name,
        value: Math.max(0, Number(item.system.itemRating ?? 0))
      }));

    if (!armorSources.length) return {value: 0, source: "None"};

    armorSources.sort((a, b) => b.value - a.value);
    return {
      value: armorSources[0].value,
      source: armorSources[0].name
    };
  }

  static #encumbranceFrom(load, strength) {
    const L = Math.max(0, Number(load) || 0);
    const S = Math.max(0, Number(strength) || 0);
    const thresholds = {
      none: S,
      light: 2 * S,
      medium: 3 * S,
      heavy: 4 * S,
      extreme: 5 * S
    };

    if (L > thresholds.extreme) return {category: "Overloaded", penalty: 5, thresholds};
    if (L > thresholds.heavy) return {category: "Extreme", penalty: 4, thresholds};
    if (L > thresholds.medium) return {category: "Heavy", penalty: 3, thresholds};
    if (L > thresholds.light) return {category: "Medium", penalty: 2, thresholds};
    if (L > thresholds.none) return {category: "Light", penalty: 1, thresholds};
    return {category: "None", penalty: 0, thresholds};
  }

  static #tokenForActor(actor) {
    if (!canvas?.ready) return null;
    return canvas.tokens.placeables.find(token => token.actor?.id === actor.id) ?? null;
  }

  static #attributeOptions(sheet, selectedKey = "") {
    return ATTRIBUTE_DEFINITIONS.map(attribute => {
      const current = Number(sheet.actor.system.attributes[attribute.key]?.current ?? 0);
      const selected = attribute.key === selectedKey ? " selected" : "";
      return `<option value="${attribute.key}"${selected}>${attribute.abbreviation} — ${attribute.label} (${current})</option>`;
    }).join("");
  }

  static #attackTasksForWeapon(sheet, weapon) {
    const available = new Set(game.aetherchrome.campaign.getAvailableTaskIds());
    const registryId = String(weapon.system.registryId ?? "").toUpperCase();

    const compatibleSkillIds = registryId.includes("BOW")
      ? new Set(["SKL-BOW"])
      : registryId.includes("DAGGER") || registryId.includes("KNIFE")
        ? new Set(["SKL-KNIVES", "SKL-THROWN"])
        : registryId.includes("SWORD")
          ? new Set(["SKL-SWORDS"])
          : new Set(["SKL-FIGHT", "SKL-MELEE", "SKL-THROWN"]);

    return TASK_CATALOG.filter(task =>
      available.has(task.id) &&
      String(task.tags ?? "").split(";").map(tag => tag.trim()).includes("Attack") &&
      compatibleSkillIds.has(task.skillId)
    );
  }

  static #attackTaskOptions(sheet, weapon) {
    return AetherchromeActorSheet.#attackTasksForWeapon(sheet, weapon)
      .map(task => {
        const skill = SKILL_CATALOG.find(entry => entry.id === task.skillId);
        return `<option value="${task.id}">${foundry.utils.escapeHTML(task.name)} — ${foundry.utils.escapeHTML(skill?.name ?? task.skillId)}</option>`;
      })
      .join("");
  }

  static #skillOptions(sheet, weapon) {
    const id = String(weapon.system.registryId ?? "");
    const allowed = id.includes("BOW")
      ? ["SKL-BOW"]
      : id.includes("DAGGER")
        ? ["SKL-KNIVES", "SKL-SWORDS"]
        : ["SKL-SWORDS", "SKL-MELEE", "SKL-FIGHT"];

    return allowed.map(skillId => {
      const skill = SKILL_CATALOG.find(entry => entry.id === skillId);
      if (!skill) return "";
      const key = dataKey(skill.id);
      const rating = Number(sheet.actor.system.skillTree[key]?.rating ?? 0);
      return `<option value="${skill.id}">${skill.name} (${rating})</option>`;
    }).join("");
  }

  static #countSuccesses(roll, threshold) {
    return roll.dice.flatMap(die => die.results)
      .filter(result => result.active !== false)
      .filter(result => Number(result.result) <= threshold)
      .length;
  }

  static #rollResults(roll) {
    return roll.dice.flatMap(die => die.results)
      .filter(result => result.active !== false)
      .map(result => Number(result.result));
  }

  static async #promptActiveDefense(targetActor, initialAim, weaponName) {
    const available = new Set(game.aetherchrome.campaign.getAvailableTaskIds());
    const options = [];

    const addTask = taskId => {
      const task = TASK_CATALOG.find(entry => entry.id === taskId);
      if (!task || !available.has(task.id)) return;
      const skill = SKILL_CATALOG.find(entry => entry.id === task.skillId);
      const rating = Number(targetActor.system.skillTree?.[dataKey(task.skillId)]?.rating ?? 0);
      options.push({task, skill, rating});
    };

    addTask("TASK-DODGE-EVADE");
    if (targetActor.items.some(item => item.type === "weapon" && item.system.ready)) {
      addTask("TASK-SWORDS-PARRY");
      addTask("TASK-KNIVES-PARRY");
    }
    if (targetActor.items.some(item => item.type === "shield" && item.system.ready)) {
      addTask("TASK-SHIELD-BLOCK-SELF");
    }

    const optionHtml = options.map(option =>
      `<option value="${option.task.id}">${foundry.utils.escapeHTML(option.task.name)} — ${foundry.utils.escapeHTML(option.skill?.name ?? "")} ${option.rating}</option>`
    ).join("");

    const choice = await DialogV2.wait({
      window: {title: `${targetActor.name}: Active Defense`},
      content: `
        <form class="aec-defense-dialog">
          <p><strong>${foundry.utils.escapeHTML(weaponName)}</strong> has Initial Aim <strong>${initialAim}</strong>.</p>
          <label><span>Defense</span>
            <select name="taskId">
              <option value="">Decline Defense</option>
              ${optionHtml}
            </select>
          </label>
        </form>`,
      buttons: [
        {
          action: "continue",
          label: "Continue",
          default: true,
          callback: (_event, button) => button.form.elements.taskId.value
        },
        {action: "cancel", label: "Decline Defense"}
      ],
      modal: true,
      rejectClose: false
    });

    if (!choice || choice === "cancel") return {adjustment: 0, label: "Declined"};

    const task = TASK_CATALOG.find(entry => entry.id === choice);
    const skill = SKILL_CATALOG.find(entry => entry.id === task?.skillId);
    if (!task || !skill) return {adjustment: 0, label: "Declined"};

    const rating = Math.max(0, Number(targetActor.system.skillTree?.[dataKey(skill.id)]?.rating ?? 0));
    const attributeKey = {
      STR: "strength", HLT: "health", INT: "intelligence",
      AGL: "agility", CHA: "charisma", ESS: "essence"
    }[String(task.typicalAttribute ?? "AGL").split("/")[0]] ?? "agility";
    const threshold = Math.max(0, Number(targetActor.system.attributes?.[attributeKey]?.current ?? 0));
    const pressure = Math.max(0, Number(targetActor.system.resources?.pressure ?? 0));
    const effort = Boolean(targetActor.system.resources?.effort?.activeDefense);
    const effectiveSkill = Math.max(0, rating - (effort ? 0 : pressure));
    const dice = effectiveSkill === 0 ? 1 : effectiveSkill;
    const rollThreshold = effectiveSkill === 0 ? chanceThreshold(threshold) : threshold;
    const roll = await new Roll(`${dice}d10`).evaluate();
    const successes = AetherchromeActorSheet.#countSuccesses(roll, rollThreshold);
    const difficulty = Math.max(0, Number(task.defaultDifficulty ?? 0));
    const adjustment = successes >= difficulty
      ? -successes
      : Math.max(0, difficulty - successes);

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({actor: targetActor}),
      flavor: `${targetActor.name} — ${task.name}`,
      content: `<section class="aec-chat-card"><h3>${task.name}</h3><p>Successes ${successes}; Aim adjustment ${signedNumber(adjustment)}.</p></section>`
    });

    if (effort) {
      await targetActor.update({
        "system.resources.effort.activeDefense": false,
        "system.resources.effort.pendingType": "",
        "system.resources.effort.pendingCost": 0
      });
    }

    return {adjustment, label: task.name};
  }

  static async #onWeaponReload(event, target) {
    event.preventDefault();
    const weapon = AetherchromeActorSheet.#embeddedItem(this, target);
    if (!weapon || weapon.type !== "weapon") return;

    const capacity = Math.max(0, Number(weapon.system.resource?.max ?? 0));
    const loaded = Math.max(0, Number(weapon.system.resource?.value ?? 0));
    if (capacity <= 0) {
      ui.notifications.warn(`${weapon.name} has no ammunition capacity.`);
      return;
    }
    if (loaded >= capacity) {
      ui.notifications.warn(`${weapon.name} is already loaded.`);
      return;
    }

    const ammoType = String(weapon.system.ammunitionType ?? "").toLowerCase();
    const ammunition = this.actor.items.find(item => {
      if (item.type !== "ammunition") return false;
      const available = Math.max(
        Number(item.system.quantity ?? 0),
        Number(item.system.resource?.value ?? 0)
      );
      return available > 0 && (
        !ammoType ||
        String(item.system.registryId ?? "").toLowerCase().includes(ammoType) ||
        String(item.name ?? "").toLowerCase().includes(ammoType)
      );
    });

    if (!ammunition) {
      ui.notifications.warn(`No compatible ${ammoType || "ammunition"} is available.`);
      return;
    }

    const quantity = Math.max(0, Number(ammunition.system.quantity ?? 0));
    const resourceValue = Math.max(0, Number(ammunition.system.resource?.value ?? 0));
    const ammoUpdate = {};
    if (quantity > 0) ammoUpdate["system.quantity"] = quantity - 1;
    if (resourceValue > 0) ammoUpdate["system.resource.value"] = resourceValue - 1;

    await ammunition.update(ammoUpdate);
    await weapon.update({"system.resource.value": Math.min(capacity, loaded + 1)});

    ui.notifications.info(`${weapon.name} loaded. Draw or Ready it before attacking.`);
  }

  static async #onWeaponAttack(event, target) {
    event.preventDefault();
    const weapon = AetherchromeActorSheet.#embeddedItem(this, target);
    if (!weapon || weapon.type !== "weapon") return;

    const targetToken = AetherchromeActorSheet.#getSingleTarget();
    if (!targetToken?.actor) {
      ui.notifications.warn("Target exactly one Actor token before attacking.");
      return;
    }

    if (targetToken.actor.id === this.actor.id) {
      ui.notifications.warn("The attacker cannot target itself with this attack workflow.");
      return;
    }

    const targetActor = targetToken.actor;
    const targetName = targetToken.name || targetActor.name;
    const targetAgility = Math.max(
      0,
      Number(targetActor.system.attributes?.agility?.current ?? 0)
    );
    const torsoArmor = AetherchromeActorSheet.#torsoArmor(targetActor);

    if (!weapon.system.ready) {
      ui.notifications.warn(`${weapon.name} is not Ready.`);
      return;
    }

    const ammoCapacity = Math.max(0, Number(weapon.system.resource?.max ?? 0));
    const loadedAmmo = Math.max(0, Number(weapon.system.resource?.value ?? 0));
    if (ammoCapacity > 0 && loadedAmmo <= 0) {
      ui.notifications.warn(`${weapon.name} is not loaded.`);
      return;
    }

    const isBow = String(weapon.system.registryId ?? "").includes("BOW");
    const attackerToken = AetherchromeActorSheet.#tokenForActor(this.actor);
    let measuredDistance = 1;
    if (isBow && attackerToken && targetToken && canvas?.grid) {
      try {
        const ray = new foundry.canvas.geometry.Ray(attackerToken.center, targetToken.center);
        measuredDistance = Math.max(
          1,
          Math.ceil((ray.distance / canvas.grid.size) * canvas.grid.distance)
        );
      } catch (_error) {
        measuredDistance = 1;
      }
    }
    const defaultAttackAttribute = "agility";
    const defaultDamageAttribute = String(weapon.system.damageAttribute ?? "strength");
    const attackTasks = AetherchromeActorSheet.#attackTasksForWeapon(this, weapon);
    const attackTaskOptions = AetherchromeActorSheet.#attackTaskOptions(this, weapon);
    if (!attackTasks.length) {
      ui.notifications.warn(`${weapon.name} has no valid campaign-available Attack Task.`);
      return;
    }
    const selectedAttackTask = attackTasks[0];
    const skillOptions = AetherchromeActorSheet.#skillOptions(this, weapon);

    const content = `
      <form class="aec-attack-dialog"><div class="aec-attack-scroll-region">
        <div class="aec-attack-summary">
          <strong>${foundry.utils.escapeHTML(weapon.name)}</strong>
          <span>Item Rating ${Number(weapon.system.itemRating ?? 0)}</span>
          <span>${weapon.system.ready ? "Ready" : "Not Ready"}</span>
        </div>

        <fieldset>
          <legend>Attack Test</legend>
          <label><span>Attack Task</span><select name="taskId">${attackTaskOptions}</select></label>
          <label><span>Skill</span><select name="skillId">${skillOptions}</select></label>
          <label><span>Attack Attribute</span>
            <select name="attackAttribute">${AetherchromeActorSheet.#attributeOptions(this, defaultAttackAttribute)}</select>
          </label>
          <label><span>Situational Modifier</span><input name="modifier" type="number" value="0" step="1"></label>
          <label><span>Take Aim / other Effective Skill bonus</span><input name="aimBonus" type="number" value="0" step="1"></label>
          ${isBow ? `
          <label><span>Distance in hexes</span><input name="distance" type="number" value="${measuredDistance}" min="1" step="1"></label>
          ` : `<input name="distance" type="hidden" value="0">`}
        </fieldset>

        <fieldset>
          <legend>Target and Aim</legend>
          <label><span>Target</span><input name="targetName" type="text" value="${foundry.utils.escapeHTML(targetName)}" readonly></label>
          <label><span>Target Agility</span><input name="targetAttribute" type="number" value="${targetAgility}" readonly></label>
          <label><span>Cover modifier to Passive Defense</span><input name="cover" type="number" value="0" min="0" max="2" step="1"></label>
          <p class="aec-dialog-note">After the attack roll, resolution pauses for the target Actor's Active Defense choice.</p>
        </fieldset>

        <fieldset>
          <legend>Damage</legend>
          <label><span>Damage Attribute</span>
            <select name="damageAttribute">${AetherchromeActorSheet.#attributeOptions(this, defaultDamageAttribute)}</select>
          </label>
          <label><span>Torso Armor</span><input name="armor" type="number" value="${torsoArmor.value}" min="0" step="1"></label>
          <label><span>Armor source</span><input type="text" value="${foundry.utils.escapeHTML(torsoArmor.source)}" readonly></label>
          <label class="aec-checkbox-row">
            <input name="applyDamage" type="checkbox" checked>
            <span>Apply resulting HP Damage to the targeted Actor</span>
          </label>
          <label><span>Explicit Damage Pool modifier</span><input name="damageModifier" type="number" value="0" step="1"></label>
          <label class="aec-checkbox-row">
            <input name="twoHanded" type="checkbox" ${String(weapon.system.grip ?? "").includes("Two-handed") ? "checked" : ""}>
            <span>Use two-handed sword grip modifier (+1 Damage Pool)</span>
          </label>
        </fieldset>
        </div>
      </form>
    `;

    const result = await DialogV2.wait({
      classes: ["aec-attack-window"],
      position: {
        width: 720,
        height: Math.min(820, Math.max(520, window.innerHeight - 80))
      },
      window: {
        title: `${this.actor.name}: Attack with ${weapon.name}`,
        contentClasses: ["aec-attack-window-content"],
        positioned: true,
        resizable: true,
        minimizable: true
      },
      content,
      buttons: [
        {
          action: "attack",
          label: "Resolve Attack",
          default: true,
          callback: (_event, button) => {
            const form = button.form;
            return {
              taskId: form.elements.taskId.value,
              skillId: form.elements.skillId.value,
              attackAttribute: form.elements.attackAttribute.value,
              modifier: Number(form.elements.modifier.value) || 0,
              aimBonus: Number(form.elements.aimBonus.value) || 0,
              distance: Number(form.elements.distance.value) || 0,
              targetName: String(form.elements.targetName.value || "Target"),
              targetAttribute: Math.max(0, Number(form.elements.targetAttribute.value) || 0),
              cover: Math.max(0, Number(form.elements.cover.value) || 0),
              damageAttribute: form.elements.damageAttribute.value,
              armor: Math.max(0, Number(form.elements.armor.value) || 0),
              applyDamage: Boolean(form.elements.applyDamage.checked),
              damageModifier: Number(form.elements.damageModifier.value) || 0,
              twoHanded: Boolean(form.elements.twoHanded.checked)
            };
          }
        },
        {action: "cancel", label: "Cancel"}
      ],
      modal: true,
      rejectClose: false,
      render: (_event, dialog) => {
        const element = dialog.element;
        if (!element) return;

        const viewportHeight = Math.max(520, window.innerHeight - 32);
        element.style.maxHeight = `${viewportHeight}px`;

        const contentElement = element.querySelector(".window-content");
        if (contentElement) {
          contentElement.style.minHeight = "0";
          contentElement.style.overflow = "hidden";
        }

        const attackForm = element.querySelector(".aec-attack-dialog");
        if (attackForm) {
          attackForm.style.minHeight = "0";
          attackForm.style.overflow = "hidden";
          const scrollRegion = attackForm.querySelector(".aec-attack-scroll-region");
          if (scrollRegion) {
            scrollRegion.style.maxHeight = `${Math.max(360, viewportHeight - 190)}px`;
            scrollRegion.style.overflowY = "scroll";
            scrollRegion.style.scrollbarGutter = "stable";
            scrollRegion.style.overscrollBehavior = "contain";
          }
        }
      }
    });

    if (!result || result === "cancel") return;

    const attackTask = TASK_CATALOG.find(entry => entry.id === result.taskId);
    const skill = SKILL_CATALOG.find(entry => entry.id === attackTask?.skillId);
    if (!attackTask || !skill) {
      ui.notifications.error("The selected Attack Task or Skill could not be found.");
      return;
    }

    const skillRating = Math.max(0, Number(this.actor.system.skillTree[dataKey(skill.id)]?.rating ?? 0));
    const taskAttributeCode = String(attackTask.typicalAttribute ?? "AGL").split("/")[0];
    const taskAttributeKey = {
      STR: "strength", HLT: "health", INT: "intelligence",
      AGL: "agility", CHA: "charisma", ESS: "essence"
    }[taskAttributeCode] ?? result.attackAttribute;
    const attackThreshold = Math.max(0, Number(this.actor.system.attributes[taskAttributeKey]?.current ?? 0));
    const pressure = Math.max(0, Number(this.actor.system.resources.pressure ?? 0));
    const effortBonus = this.actor.system.resources.effort?.openSkill ? 1 : 0;

    let rangeModifier = 0;
    let rangeIncrement = 0;
    if (isBow) {
      const increment = Math.max(1, Number(weapon.system.rangeIncrement ?? 0));
      rangeIncrement = Math.ceil(result.distance / increment);
      const maximum = Math.max(0, Number(weapon.system.maximumIncrements ?? 0));
      if (maximum && rangeIncrement > maximum) {
        ui.notifications.warn(`${result.targetName} is beyond ${weapon.name}'s maximum range.`);
        return;
      }
      rangeModifier = -(Math.max(1, rangeIncrement) - 1);
    }

    const effectiveSkill = Math.max(
      0,
      skillRating + result.modifier + result.aimBonus + rangeModifier + effortBonus - pressure
    );
    const chanceDie = effectiveSkill === 0;
    const attackDice = chanceDie ? 1 : effectiveSkill;
    const attackSuccessThreshold = chanceDie ? chanceThreshold(attackThreshold) : attackThreshold;
    const attackRoll = await new Roll(`${attackDice}d10`).evaluate();
    const attackSuccesses = AetherchromeActorSheet.#countSuccesses(attackRoll, attackSuccessThreshold);
    const passiveDefense = Math.ceil(result.targetAttribute / 2) + result.cover;
    const initialAim = attackSuccesses - passiveDefense;
    const defense = await AetherchromeActorSheet.#promptActiveDefense(
      targetActor,
      initialAim,
      weapon.name
    );
    const finalAim = initialAim + defense.adjustment;

    const weaponRating = Number(weapon.system.itemRating ?? 0);
    const gripModifier = result.twoHanded && String(weapon.system.registryId ?? "").includes("SWORD") ? 1 : 0;
    const damagePool = Math.max(0, finalAim + weaponRating + gripModifier + result.damageModifier);
    const damageThreshold = Math.max(0, Number(this.actor.system.attributes[result.damageAttribute]?.current ?? 0));

    const rollMode = game.settings.get("core", "rollMode");
    const attackResults = AetherchromeActorSheet.#rollResults(attackRoll);
    const attackContent = `
      <section class="aec-chat-card aec-attack-card">
        <h3>${foundry.utils.escapeHTML(this.actor.name)} attacks ${foundry.utils.escapeHTML(result.targetName)}</h3>
        <div class="aec-chat-grid">
          <span>Target Token</span><strong>${foundry.utils.escapeHTML(targetName)}</strong>
          <span>Target Actor</span><strong>${foundry.utils.escapeHTML(targetActor.name)}</strong>
          <span>Weapon</span><strong>${foundry.utils.escapeHTML(weapon.name)}</strong>
          <span>Attack Task</span><strong>${foundry.utils.escapeHTML(attackTask.name)}</strong>
          <span>Skill</span><strong>${foundry.utils.escapeHTML(skill.name)} ${skillRating}</strong>
          <span>Attack Attribute</span><strong>${attackThreshold}</strong>
          <span>Situational</span><strong>${signedNumber(result.modifier)}</strong>
          <span>Take Aim / bonus</span><strong>${signedNumber(result.aimBonus)}</strong>
          <span>Range</span><strong>${isBow ? `${result.distance} hexes · increment ${rangeIncrement} (${signedNumber(rangeModifier)})` : "Close"}</strong>
          <span>Pressure</span><strong>−${pressure}</strong>
          <span>Effort</span><strong>${signedNumber(effortBonus)}</strong>
          <span>Effective Skill</span><strong>${effectiveSkill}${chanceDie ? " · Chance Die" : ""}</strong>
          <span>Dice</span><strong>${attackResults.join(", ")}</strong>
          <span>Attack Successes</span><strong>${attackSuccesses}</strong>
          <span>Passive Defense</span><strong>${passiveDefense}</strong>
          <span>Initial Aim</span><strong>${initialAim}</strong>
          <span>Active Defense</span><strong>${foundry.utils.escapeHTML(defense.label)}</strong>
          <span>Defense adjustment</span><strong>${signedNumber(defense.adjustment)}</strong>
          <span>Final Aim</span><strong>${finalAim}</strong>
        </div>
      </section>
    `;

    const attackMessage = await attackRoll.toMessage(
      {
        speaker: ChatMessage.getSpeaker({actor: this.actor}),
        flavor: `${this.actor.name} — ${weapon.name} Attack`,
        content: attackContent
      },
      {messageMode: rollMode}
    );

    if (effortBonus > 0) {
      await this.actor.update({
        "system.resources.effort.openSkill": false,
        "system.resources.effort.pendingType": "",
        "system.resources.effort.pendingCost": 0
      });
    }

    let damageSuccesses = 0;
    let damageResults = [];
    let damageRoll = null;

    if (damagePool > 0) {
      damageRoll = await new Roll(`${damagePool}d10`).evaluate();
      damageSuccesses = AetherchromeActorSheet.#countSuccesses(damageRoll, damageThreshold);
      damageResults = AetherchromeActorSheet.#rollResults(damageRoll);
    }

    const hpDamage = Math.max(0, damageSuccesses - result.armor);
    const hpBefore = Number(targetActor.system.resources?.health?.value ?? 0);
    let hpAfter = hpBefore;
    let damageApplied = false;

    if (result.applyDamage && hpDamage > 0) {
      if (!targetActor.isOwner && !game.user.isGM) {
        ui.notifications.warn(
          `You do not have permission to apply damage to ${targetActor.name}. Damage was rolled but not applied.`
        );
      } else {
        hpAfter = hpBefore - hpDamage;
        await targetActor.update({"system.resources.health.value": hpAfter});
        damageApplied = true;
      }
    }

    const damageContent = `
      <section class="aec-chat-card aec-damage-card">
        <h3>Damage from ${foundry.utils.escapeHTML(weapon.name)}</h3>
        <p class="aec-chat-link">Attack message: ${attackMessage?.id ?? "linked attack"}</p>
        <div class="aec-chat-grid">
          <span>Final Aim</span><strong>${finalAim}</strong>
          <span>Weapon Item Rating</span><strong>${weaponRating}</strong>
          <span>Grip modifier</span><strong>${signedNumber(gripModifier)}</strong>
          <span>Other Damage modifier</span><strong>${signedNumber(result.damageModifier)}</strong>
          <span>Damage Pool</span><strong>${damagePool}</strong>
          <span>Damage Attribute</span><strong>${damageThreshold}</strong>
          <span>Dice</span><strong>${damageResults.length ? damageResults.join(", ") : "No roll"}</strong>
          <span>Damage Successes</span><strong>${damageSuccesses}</strong>
          <span>Final Armor</span><strong>${result.armor}</strong>
          <span>HP Damage</span><strong>${hpDamage}</strong>
          <span>Applied to target</span><strong>${damageApplied ? "Yes" : "No"}</strong>
          <span>Target HP</span><strong>${damageApplied ? `${hpBefore} → ${hpAfter}` : hpBefore}</strong>
        </div>
      </section>
    `;

    if (damageRoll) {
      await damageRoll.toMessage(
        {
          speaker: ChatMessage.getSpeaker({actor: this.actor}),
          flavor: `${this.actor.name} — ${weapon.name} Damage`,
          content: damageContent
        },
        {messageMode: rollMode}
      );
    } else {
      const messageData = {
        speaker: ChatMessage.getSpeaker({actor: this.actor}),
        flavor: `${this.actor.name} — ${weapon.name} Damage`,
        content: damageContent
      };
      ChatMessage.applyRollMode(messageData, rollMode);
      await ChatMessage.create(messageData);
    }

    if (damageApplied) {
      ui.notifications.info(`${targetActor.name} takes ${hpDamage} HP Damage.`);
    }

    if (ammoCapacity > 0) {
      await weapon.update({
        "system.resource.value": Math.max(0, loadedAmmo - 1),
        "system.ready": false
      });
    }
  }

  static async #onApplyEquipmentPackage(event, target) {
    event.preventDefault();
    const section = target.closest(".aec-equipment-package");
    const packageId = section?.querySelector("select")?.value;
    const packageRecord = game.aetherchrome.campaign
      .getEquipmentPackages()
      .find(entry => entry.id === packageId) ?? null;

    if (!packageRecord) {
      ui.notifications.warn("Select an Alpha equipment package first.");
      return;
    }

    if (this.actor.system.equipment?.packageId) {
      ui.notifications.warn("This Actor already has a recorded equipment package.");
      return;
    }

    if (this.actor.items.size > 0) {
      ui.notifications.warn("Remove existing embedded Items before applying an Alpha package.");
      return;
    }

    const confirmed = await DialogV2.confirm({
      window: {title: `Apply ${packageRecord.name} Package`},
      content: `
        <p>Apply <strong>${packageRecord.name}</strong> (${packageRecord.role}) to
        <strong>${foundry.utils.escapeHTML(this.actor.name)}</strong>?</p>
        <p>This creates ${packageRecord.items.length} embedded Item records and records package
        <code>${packageRecord.id}</code>.</p>
      `,
      yes: {label: "Apply Package"},
      no: {label: "Cancel"},
      modal: true
    });
    if (!confirmed) return;

    await this.actor.createEmbeddedDocuments(
      "Item",
      packageRecord.items.map(item => foundry.utils.deepClone(item))
    );
    await this.actor.update({
      "system.equipment.packageId": packageRecord.id,
      "system.equipment.currentEncumbrance": ""
    });

    ui.notifications.info(`${packageRecord.name} equipment package applied.`);
  }

  static async #onTaskDetails(event, target) {
    event.preventDefault();

    const row = target.closest(".aec-tree-row");
    const skillId = target.dataset.skillId;
    const skill = SKILL_CATALOG.find(entry => entry.id === skillId);
    const select = row.querySelector("select");
    const ratingInput = row.querySelector('input[type="number"]');
    const taskId = select?.value;

    if (!taskId) {
      ui.notifications.warn("Select a Task first.");
      return;
    }

    const task = TASK_CATALOG.find(entry => entry.id === taskId);
    if (!skill || !task) {
      ui.notifications.error("The selected Skill or Task could not be found.");
      return;
    }

    const baseSkill = Math.max(0, Number(ratingInput?.value ?? 0));

    if (task.rollMode === "automatic") {
      await DialogV2.confirm({
        window: { title: `${task.name} — Automatic Task` },
        content: AetherchromeActorSheet.#taskDetailsHtml(skill, task, baseSkill, null, true),
        yes: { label: "Acknowledge" },
        no: { label: "Close" },
        modal: true,
        rejectClose: false
      });
      return;
    }

    if (task.rollMode === "chained") {
      await DialogV2.confirm({
        window: { title: `${task.name} — Chained Task` },
        content: AetherchromeActorSheet.#taskDetailsHtml(skill, task, baseSkill, null, true) +
          '<p class="aec-dialog-warning">This Task modifies a legal base Attack. It does not create an independent Skill Pool roll.</p>',
        yes: { label: "Acknowledge" },
        no: { label: "Close" },
        modal: true,
        rejectClose: false
      });
      return;
    }

    const optionHtml = [
      '<option value="" selected>Select Attribute…</option>',
      ...ATTRIBUTE_DEFINITIONS.map(attribute => {
        const current = this.actor.system.attributes[attribute.key].current;
        return `<option value="${attribute.key}">${attribute.abbreviation} — ${attribute.label} (${current})</option>`;
      })
    ].join("");

    const content = `
      ${AetherchromeActorSheet.#taskDetailsHtml(skill, task, baseSkill)}
      <div class="aec-roll-fields">
        <label>
          <span>Current Attribute</span>
          <select name="attributeKey" required>${optionHtml}</select>
        </label>
        <label>
          <span>Base Skill</span>
          <input name="baseSkill" type="number" value="${baseSkill}" min="0" max="10" readonly>
        </label>
        <label>
          <span>Situational Modifier</span>
          <input name="modifier" type="number" value="0" step="1">
        </label>
        <label>
          <span>Pressure Penalty</span>
          <input name="pressure" type="number" value="-${Math.max(0, Number(this.actor.system.resources.pressure ?? 0))}" readonly>
        </label>
        <label>
          <span>Difficulty</span>
          <input name="difficulty" type="number" value="${task.defaultDifficulty}" min="0" step="1">
        </label>
        <label class="aec-roll-notes">
          <span>Roll Note</span>
          <input name="note" type="text" placeholder="Optional context">
        </label>
      </div>
      <p class="aec-dialog-note">Contextual and opposed Difficulties default to 1 for data entry only. Set the value required by the applicable Task or opposition procedure.</p>
    `;

    const formData = await DialogV2.wait({
      window: { title: `${skill.name}: ${task.name}` },
      content,
      buttons: [
        {
          action: "roll",
          label: "Roll Skill Pool",
          icon: "fa-solid fa-dice-d10",
          default: true,
          callback: (event, button) => {
            const elements = button.form?.elements;
            if (!elements) throw new Error("Aetherchrome | Skill Pool dialog form was unavailable.");

            return {
              attributeKey: elements.attributeKey.value,
              modifier: elements.modifier.value,
              difficulty: elements.difficulty.value,
              note: elements.note.value
            };
          }
        },
        {
          action: "cancel",
          label: "Cancel"
        }
      ],
      modal: true,
      rejectClose: false
    });

    if (!formData || formData === "cancel") return;

    try {
      const attributeKey = String(formData.attributeKey);
      if (!attributeKey) {
        ui.notifications.warn("Select an Attribute before rolling.");
        return;
      }

      const modifier = Number(formData.modifier) || 0;
      const difficulty = Math.max(0, Number(formData.difficulty) || 0);
      const note = String(formData.note ?? "").trim();

      await AetherchromeActorSheet.#rollSkillPool(this, {
        skill,
        task,
        attributeKey,
        baseSkill,
        modifier,
        difficulty,
        note
      });
    } catch (error) {
      console.error("Aetherchrome | Skill Pool roll failed", error);
      ui.notifications.error("Aetherchrome Skill Pool roll failed. Open the Foundry console with F12 for details.");
    }
  }

  static #taskDetailsHtml(skill, task, baseSkill, compact = false) {
    const escape = foundry.utils.escapeHTML;
    return `
      <section class="aec-task-dialog">
        <header>
          <div>
            <h2>${escape(task.name)}</h2>
            <p>${escape(skill.name)} · Base Skill ${baseSkill}</p>
          </div>
          <span class="aec-task-status">${escape(task.status)}</span>
        </header>
        <dl>
          <div><dt>Resolution</dt><dd>${escape(task.resolutionType)}</dd></div>
          <div><dt>Difficulty</dt><dd>${escape(task.difficulty)}</dd></div>
          <div><dt>Time</dt><dd>${escape(task.time)}</dd></div>
          <div><dt>Requirements</dt><dd>${escape(task.requirements)}</dd></div>
          ${task.tags ? `<div><dt>Tags</dt><dd>${escape(task.tags)}</dd></div>` : ""}
        </dl>
      </section>
    `;
  }

  static async #rollSkillPool(sheet, {skill, task, attributeKey, baseSkill, modifier, difficulty, note}) {
    const attributeDefinition = ATTRIBUTE_DEFINITIONS.find(entry => entry.key === attributeKey);
    if (!attributeDefinition || !sheet.actor.system.attributes[attributeKey]) {
      throw new Error(`Unknown governing Attribute: ${attributeKey}`);
    }

    const attribute = Math.max(0, Number(sheet.actor.system.attributes[attributeKey].current ?? 0));
    const pressure = Math.max(0, Math.min(4, Number(sheet.actor.system.resources.pressure ?? 0)));
    const effortBonus = sheet.actor.system.resources.effort?.openSkill ? 1 : 0;
    const effectiveSkill = Math.max(0, baseSkill + modifier + effortBonus - pressure);
    const isChanceDie = effectiveSkill === 0;
    const threshold = isChanceDie ? chanceThreshold(attribute) : attribute;
    const diceCount = isChanceDie ? 1 : effectiveSkill;
    const roll = await new Roll(`${diceCount}d10`).evaluate();
    const results = roll.dice.flatMap(die => die.results.map(result => result.result));
    const successes = results.filter(result => result <= threshold).length;
    const success = successes >= difficulty;
    const critical = difficulty > 0 && success && successes >= (difficulty * 2);
    const margin = successes - difficulty;

    const resultLabel = critical ? "Critical Success" : (success ? "Success" : "Failure");
    const dieClass = result => result <= threshold ? "aec-die-success" : "aec-die-failure";
    const diceHtml = results.map(result => `<span class="aec-result-die ${dieClass(result)}">${result}</span>`).join("");

    const content = `
      <article class="aec-chat-card">
        <header>
          <h3>${foundry.utils.escapeHTML(task.name)}</h3>
          <span class="aec-chat-result">${resultLabel}</span>
        </header>
        <div class="aec-chat-grid">
          <span>Skill</span><strong>${foundry.utils.escapeHTML(skill.name)} ${baseSkill}</strong>
          <span>Attribute</span><strong>${attributeDefinition.abbreviation} ${attribute}</strong>
          <span>Situational Modifier</span><strong>${signedNumber(modifier)}</strong>
          <span>Effort</span><strong>${signedNumber(effortBonus)}</strong>
          <span>Pressure</span><strong>−${pressure}</strong>
          <span>Effective Skill</span><strong>${effectiveSkill}</strong>
          <span>Difficulty</span><strong>${difficulty}</strong>
          <span>Successes</span><strong>${successes}</strong>
          <span>Margin</span><strong>${signedNumber(margin)}</strong>
        </div>
        <div class="aec-dice-results">${diceHtml}</div>
        ${isChanceDie ? `<p class="aec-chance-note">Chance Die · threshold ${threshold}</p>` : ""}
        ${note ? `<p class="aec-roll-note">${foundry.utils.escapeHTML(note)}</p>` : ""}
      </article>
    `;

    const rollMode = game.settings.get("core", "rollMode");
    await roll.toMessage(
      {
        speaker: ChatMessage.getSpeaker({ actor: sheet.actor }),
        flavor: `${sheet.actor.name} — ${skill.name}: ${task.name}`,
        content
      },
      {
        messageMode: rollMode
      }
    );

    if (effortBonus > 0) {
      await sheet.actor.update({"system.resources.effort.openSkill": false});
    }
  }
}

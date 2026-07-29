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

function buildTree(actor) {
  const byParent = new Map();
  for (const skill of SKILL_CATALOG) {
    const parent = skill.parentId ?? "ROOT";
    const children = byParent.get(parent) ?? [];
    children.push(skill);
    byParent.set(parent, children);
  }

  const buildNode = (skill, depth = 0) => {
    const key = dataKey(skill.id);
    const record = actor.system.skillTree[key];
    const tasks = TASK_CATALOG
      .filter(task => task.skillId === skill.id)
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
  static DEFAULT_OPTIONS = {
    classes: ["aetherchrome", "actor-sheet"],
    position: { width: 860, height: 780 },
    form: { closeOnSubmit: false },
    actions: {
      diagnosticRoll: AetherchromeActorSheet.#onDiagnosticRoll,
      taskDetails: AetherchromeActorSheet.#onTaskDetails,
      pressureDecrease: AetherchromeActorSheet.#onPressureDecrease,
      pressureIncrease: AetherchromeActorSheet.#onPressureIncrease,
      hpDecrease: AetherchromeActorSheet.#onHpDecrease,
      hpIncrease: AetherchromeActorSheet.#onHpIncrease,
      mpDecrease: AetherchromeActorSheet.#onMpDecrease,
      mpIncrease: AetherchromeActorSheet.#onMpIncrease,
      openEffortDialog: AetherchromeActorSheet.#onOpenEffortDialog,
      toggleSkillBranch: AetherchromeActorSheet.#onToggleSkillBranch,
      expandAllSkills: AetherchromeActorSheet.#onExpandAllSkills,
      collapseAllSkills: AetherchromeActorSheet.#onCollapseAllSkills
    }
  };

  static PARTS = {
    form: { template: "systems/aetherchrome/templates/actor/actor-sheet.hbs" }
  };

  async _prepareContext(options) {
    await this.#normalizeDerivedResources();
    const context = await super._prepareContext(options);
    const expansion = await this.#getSkillExpansion();
    const allRows = flattenTree(buildTree(this.actor));
    const hiddenDepths = [];

    const skillRows = allRows.map(row => {
      while (hiddenDepths.length && hiddenDepths.at(-1) >= row.depth) hiddenDepths.pop();
      const hidden = hiddenDepths.length > 0;
      const hasChildren = row.children.length > 0;
      const expanded = hasChildren && expansion.has(row.id);

      if (hasChildren && !expanded) hiddenDepths.push(row.depth);

      return {
        ...row,
        hasChildren,
        expanded,
        hidden
      };
    });

    return foundry.utils.mergeObject(context, {
      actor: this.actor,
      system: this.actor.system,
      editable: this.isEditable,
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
      activeDefenseEffortPending: Boolean(this.actor.system.resources.effort?.activeDefense)
    }, { inplace: false });
  }

  #resourceContext(resourceKey) {
    const isHealth = resourceKey === "health";
    const attributeKey = isHealth ? "health" : "essence";
    const maximum = Math.max(0, Number(this.actor.system.attributes[attributeKey]?.base ?? 0));
    const storedValue = Number(this.actor.system.resources[resourceKey]?.value ?? maximum);
    const minimum = -5 * maximum;
    const value = Math.max(minimum, Math.min(maximum, storedValue));

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
      atMinimum: value <= minimum,
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

  static async #onDiagnosticRoll(event) {
    event.preventDefault();
    const roll = await new Roll("1d10").evaluate();
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `${this.actor.name}: Aetherchrome diagnostic d10`
    });
  }

  static async #adjustResource(sheet, resourceKey, delta) {
    const context = sheet.#resourceContext(resourceKey);
    const next = Math.max(context.minimum, Math.min(context.maximum, context.value + delta));
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

    const content = `
      <form class="aec-effort-dialog">
        <p><strong>Current MP:</strong> ${this.#resourceContext("magic").value}</p>

        <fieldset>
          <legend>Open Skill Effort — 1 MP</legend>
          <p>Apply +1 Effective Skill to the next eligible Open Skill roll.</p>
          <button type="button" data-effort="openSkill">Spend 1 MP</button>
        </fieldset>

        <fieldset>
          <legend>Active Defense Effort — 1 MP</legend>
          <p>Ignore Pressure penalties on the next eligible Active Defense.</p>
          <button type="button" data-effort="activeDefense">Spend 1 MP</button>
        </fieldset>

        <fieldset>
          <legend>Specified-Cost Activation — Variable MP</legend>
          <label>
            <span>Amount</span>
            <input name="amount" type="number" min="1" step="1" value="1">
          </label>
          <label>
            <span>Source or note</span>
            <input name="note" type="text" value="">
          </label>
          <button type="button" data-effort="variable">Spend MP</button>
        </fieldset>
      </form>
    `;

    await DialogV2.wait({
      window: { title: `${this.actor.name}: Effort` },
      content,
      buttons: [{action: "close", label: "Close", default: true}],
      render: (_event, dialog) => {
        const form = dialog.element.querySelector("form");
        form?.querySelectorAll("[data-effort]").forEach(button => {
          button.addEventListener("click", async clickEvent => {
            clickEvent.preventDefault();

            const effort = button.dataset.effort;
            const live = this.#resourceContext("magic");
            let cost = 1;
            let note = "";

            if (effort === "variable") {
              cost = Math.max(1, Number(form.elements.amount.value) || 1);
              note = String(form.elements.note.value ?? "").trim();
            }

            const nextMp = live.value - cost;
            if (nextMp < live.minimum) {
              ui.notifications.warn(`MP cannot fall below ${live.minimum} in this Alpha tracker.`);
              return;
            }

            const update = {"system.resources.magic.value": nextMp};
            if (effort === "openSkill") update["system.resources.effort.openSkill"] = true;
            if (effort === "activeDefense") update["system.resources.effort.activeDefense"] = true;

            await this.actor.update(update);

            const label = effort === "openSkill"
              ? "Open Skill Effort"
              : effort === "activeDefense"
                ? "Active Defense Effort"
                : "Specified-Cost Activation";

            const suffix = note ? ` — ${foundry.utils.escapeHTML(note)}` : "";
            ui.notifications.info(`${label}: spent ${cost} MP${suffix}. Current MP ${nextMp}.`);
            this.render();
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
    this.render();
  }

  static async #onExpandAllSkills(event) {
    event.preventDefault();
    const expansion = new Set(
      SKILL_CATALOG
        .filter(skill => SKILL_CATALOG.some(candidate => candidate.parentId === skill.id))
        .map(skill => skill.id)
    );
    await this.#setSkillExpansion(expansion);
    this.render();
  }

  static async #onCollapseAllSkills(event) {
    event.preventDefault();
    await this.#setSkillExpansion(new Set());
    this.render();
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

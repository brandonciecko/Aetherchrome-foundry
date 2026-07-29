export const SKILL_CATALOG = [
  {
    "id": "SKL-FIGHT",
    "name": "Fight",
    "recordType": "Skill",
    "parentId": null,
    "primaryAttribute": "AGL"
  },
  {
    "id": "SKL-MELEE",
    "name": "Melee",
    "recordType": "Skill",
    "parentId": "SKL-FIGHT",
    "primaryAttribute": "AGL"
  },
  {
    "id": "SKL-SWORDS",
    "name": "Swords",
    "recordType": "Specialization",
    "parentId": "SKL-MELEE",
    "primaryAttribute": "AGL"
  },
  {
    "id": "SKL-KNIVES",
    "name": "Knives",
    "recordType": "Specialization",
    "parentId": "SKL-MELEE",
    "primaryAttribute": "AGL"
  },
  {
    "id": "SKL-SHIELD",
    "name": "Shield",
    "recordType": "Skill",
    "parentId": "SKL-FIGHT",
    "primaryAttribute": "AGL"
  },
  {
    "id": "SKL-RANGED",
    "name": "Ranged",
    "recordType": "Skill",
    "parentId": "SKL-FIGHT",
    "primaryAttribute": "STR"
  },
  {
    "id": "SKL-THROWN",
    "name": "Thrown",
    "recordType": "Specialization",
    "parentId": "SKL-RANGED",
    "primaryAttribute": "AGL"
  },
  {
    "id": "SKL-BOW",
    "name": "Bow",
    "recordType": "Specialization",
    "parentId": "SKL-RANGED",
    "primaryAttribute": "AGL"
  },
  {
    "id": "SKL-TRIGGERED",
    "name": "Triggered",
    "recordType": "Specialization",
    "parentId": "SKL-RANGED",
    "primaryAttribute": "AGL"
  },
  {
    "id": "SKL-MOVEMENT",
    "name": "Movement",
    "recordType": "Skill",
    "parentId": null,
    "primaryAttribute": "AGL"
  },
  {
    "id": "SKL-ACROBATICS",
    "name": "Acrobatics",
    "recordType": "Skill",
    "parentId": "SKL-MOVEMENT",
    "primaryAttribute": "AGL"
  },
  {
    "id": "SKL-DODGE",
    "name": "Dodge",
    "recordType": "Skill",
    "parentId": "SKL-MOVEMENT",
    "primaryAttribute": "AGL"
  },
  {
    "id": "SKL-RUNNING",
    "name": "Running",
    "recordType": "Skill",
    "parentId": "SKL-MOVEMENT",
    "primaryAttribute": "AGL"
  },
  {
    "id": "SKL-AWARENESS",
    "name": "Awareness",
    "recordType": "Skill",
    "parentId": null,
    "primaryAttribute": "INT"
  },
  {
    "id": "SKL-OBSERVATION",
    "name": "Observation",
    "recordType": "Skill",
    "parentId": "SKL-AWARENESS",
    "primaryAttribute": "INT"
  },
  {
    "id": "SKL-SUBTERFUGE",
    "name": "Subterfuge",
    "recordType": "Skill",
    "parentId": null,
    "primaryAttribute": "INT"
  },
  {
    "id": "SKL-STEALTH",
    "name": "Stealth",
    "recordType": "Skill",
    "parentId": "SKL-SUBTERFUGE",
    "primaryAttribute": "AGL"
  },
  {
    "id": "SKL-CONCEALMENT",
    "name": "Concealment",
    "recordType": "Skill",
    "parentId": "SKL-SUBTERFUGE",
    "primaryAttribute": "INT"
  },
  {
    "id": "SKL-WARFARE",
    "name": "Warfare",
    "recordType": "Skill",
    "parentId": null,
    "primaryAttribute": "INT"
  },
  {
    "id": "SKL-TACTICS",
    "name": "Tactics",
    "recordType": "Skill",
    "parentId": "SKL-WARFARE",
    "primaryAttribute": "INT"
  },
  {
    "id": "SKL-KNOWLEDGE",
    "name": "Knowledge",
    "recordType": "Skill",
    "parentId": null,
    "primaryAttribute": "INT"
  },
  {
    "id": "SKL-MEDICINE",
    "name": "Medicine",
    "recordType": "Skill",
    "parentId": "SKL-KNOWLEDGE",
    "primaryAttribute": "INT"
  },
  {
    "id": "SKL-PHYSICIAN",
    "name": "Physician",
    "recordType": "Specialization",
    "parentId": "SKL-MEDICINE",
    "primaryAttribute": "INT"
  },
  {
    "id": "SKL-CRAFT",
    "name": "Craft",
    "recordType": "Skill",
    "parentId": null,
    "primaryAttribute": "INT"
  },
  {
    "id": "SKL-CRAFT-WEAPONS",
    "name": "Weapons",
    "recordType": "Skill",
    "parentId": "SKL-CRAFT",
    "primaryAttribute": "INT"
  },
  {
    "id": "SKL-FLETCHER",
    "name": "Fletcher",
    "recordType": "Specialization",
    "parentId": "SKL-CRAFT-WEAPONS",
    "primaryAttribute": "INT"
  },
  {
    "id": "SKL-FOCUS",
    "name": "Focus",
    "recordType": "Skill",
    "parentId": null,
    "primaryAttribute": "INT"
  }
];

export const TASK_CATALOG = [
  {
    "id": "TASK-FIGHT-KEEP-NERVE",
    "name": "Keep Nerve",
    "skillId": "SKL-FIGHT",
    "typicalAttribute": "HLT",
    "status": "Provisional"
  },
  {
    "id": "TASK-FIGHT-RECOGNIZE-VIOLENCE",
    "name": "Recognize Violence",
    "skillId": "SKL-FIGHT",
    "typicalAttribute": "INT",
    "status": "Provisional"
  },
  {
    "id": "TASK-FIGHT-UNARMED-ATTACK",
    "name": "Unarmed Attack",
    "skillId": "SKL-FIGHT",
    "typicalAttribute": "AGL",
    "status": "Active Working"
  },
  {
    "id": "TASK-FIGHT-IMPROVISED-AGGRESSION",
    "name": "Improvised Aggression",
    "skillId": "SKL-FIGHT",
    "typicalAttribute": "AGL/STR",
    "status": "Provisional"
  },
  {
    "id": "TASK-FIGHT-SHOVE",
    "name": "Fight Shove",
    "skillId": "SKL-FIGHT",
    "typicalAttribute": "STR/AGL",
    "status": "Provisional"
  },
  {
    "id": "TASK-FIGHT-CALLED-SHOT",
    "name": "Called Shot",
    "skillId": "SKL-FIGHT",
    "typicalAttribute": "Base Attack",
    "status": "Active Working"
  },
  {
    "id": "TASK-MELEE-BASIC-ATTACK",
    "name": "Basic Melee Attack",
    "skillId": "SKL-MELEE",
    "typicalAttribute": "AGL",
    "status": "Active Working"
  },
  {
    "id": "TASK-MELEE-BASIC-PARRY",
    "name": "Basic Parry",
    "skillId": "SKL-MELEE",
    "typicalAttribute": "AGL",
    "status": "Active Working"
  },
  {
    "id": "TASK-MELEE-IMPROVISED-BLOCK",
    "name": "Improvised Block",
    "skillId": "SKL-MELEE",
    "typicalAttribute": "AGL",
    "status": "Provisional"
  },
  {
    "id": "TASK-MELEE-SHOVE",
    "name": "Shove",
    "skillId": "SKL-MELEE",
    "typicalAttribute": "STR",
    "status": "Active Working"
  },
  {
    "id": "TASK-MELEE-HEAVY-BLOW",
    "name": "Heavy Blow",
    "skillId": "SKL-MELEE",
    "typicalAttribute": "STR",
    "status": "Active Working"
  },
  {
    "id": "TASK-SWORDS-ATTACK",
    "name": "Sword Attack",
    "skillId": "SKL-SWORDS",
    "typicalAttribute": "AGL",
    "status": "Active Working"
  },
  {
    "id": "TASK-SWORDS-ATTACK-FORCEFUL-LIGHT",
    "name": "Forceful Light-Sword Attack",
    "skillId": "SKL-SWORDS",
    "typicalAttribute": "STR",
    "status": "Active Working"
  },
  {
    "id": "TASK-SWORDS-PARRY",
    "name": "Sword Parry",
    "skillId": "SKL-SWORDS",
    "typicalAttribute": "AGL",
    "status": "Active Working"
  },
  {
    "id": "TASK-SWORDS-READY",
    "name": "Ready Sword",
    "skillId": "SKL-SWORDS",
    "typicalAttribute": "AGL",
    "status": "Active Working"
  },
  {
    "id": "TASK-KNIVES-ATTACK-QUICK",
    "name": "Quick Knife Attack",
    "skillId": "SKL-KNIVES",
    "typicalAttribute": "AGL",
    "status": "Active Working"
  },
  {
    "id": "TASK-KNIVES-ATTACK-FORCEFUL",
    "name": "Forceful Knife Attack",
    "skillId": "SKL-KNIVES",
    "typicalAttribute": "STR",
    "status": "Active Working"
  },
  {
    "id": "TASK-KNIVES-PARRY",
    "name": "Knife Parry",
    "skillId": "SKL-KNIVES",
    "typicalAttribute": "AGL",
    "status": "Active Working"
  },
  {
    "id": "TASK-KNIVES-READY",
    "name": "Ready Knife",
    "skillId": "SKL-KNIVES",
    "typicalAttribute": "AGL",
    "status": "Active Working"
  },
  {
    "id": "TASK-SHIELD-PRESENT",
    "name": "Present Shield",
    "skillId": "SKL-SHIELD",
    "typicalAttribute": "AGL/STR",
    "status": "Active Working"
  },
  {
    "id": "TASK-SHIELD-MAINTAIN-CONTROL",
    "name": "Maintain Shield Control",
    "skillId": "SKL-SHIELD",
    "typicalAttribute": "STR/HLT",
    "status": "Provisional"
  },
  {
    "id": "TASK-SHIELD-BLOCK-SELF",
    "name": "Shield Block",
    "skillId": "SKL-SHIELD",
    "typicalAttribute": "STR",
    "status": "Active Working"
  },
  {
    "id": "TASK-SHIELD-COVER-SUBJECT",
    "name": "Cover Subject",
    "skillId": "SKL-SHIELD",
    "typicalAttribute": "AGL/INT",
    "status": "Provisional"
  },
  {
    "id": "TASK-SHIELD-COVER-AREA",
    "name": "Cover Area",
    "skillId": "SKL-SHIELD",
    "typicalAttribute": "AGL/INT",
    "status": "Provisional"
  },
  {
    "id": "TASK-RANGED-RELOAD",
    "name": "Reload",
    "skillId": "SKL-RANGED",
    "typicalAttribute": "AGL",
    "status": "Active Working"
  },
  {
    "id": "TASK-THROWN-THROW-WEAPON",
    "name": "Throw Weapon",
    "skillId": "SKL-THROWN",
    "typicalAttribute": "AGL",
    "status": "Active Working"
  },
  {
    "id": "TASK-THROWN-THROW-KNIFE",
    "name": "Throw Knife",
    "skillId": "SKL-THROWN",
    "typicalAttribute": "STR",
    "status": "Active Working"
  },
  {
    "id": "TASK-BOW-SHOOT",
    "name": "Shoot",
    "skillId": "SKL-BOW",
    "typicalAttribute": "AGL",
    "status": "Active Working"
  },
  {
    "id": "TASK-BOW-DRAW-BOW",
    "name": "Draw Bow",
    "skillId": "SKL-BOW",
    "typicalAttribute": "AGL",
    "status": "Active Working"
  },
  {
    "id": "TASK-TRIGGERED-FIRE",
    "name": "Fire",
    "skillId": "SKL-TRIGGERED",
    "typicalAttribute": "AGL",
    "status": "Active Working"
  },
  {
    "id": "TASK-MOVEMENT-STEP",
    "name": "Step",
    "skillId": "SKL-MOVEMENT",
    "typicalAttribute": "AGL",
    "status": "Provisional"
  },
  {
    "id": "TASK-MOVEMENT-MOVE",
    "name": "Move",
    "skillId": "SKL-MOVEMENT",
    "typicalAttribute": "AGL",
    "status": "Provisional"
  },
  {
    "id": "TASK-MOVEMENT-WITHDRAWAL",
    "name": "Withdrawal",
    "skillId": "SKL-MOVEMENT",
    "typicalAttribute": "AGL",
    "status": "Provisional"
  },
  {
    "id": "TASK-ACROBATICS-BALANCE",
    "name": "Balance",
    "skillId": "SKL-ACROBATICS",
    "typicalAttribute": "AGL",
    "status": "Provisional"
  },
  {
    "id": "TASK-ACROBATICS-TUMBLE",
    "name": "Tumble",
    "skillId": "SKL-ACROBATICS",
    "typicalAttribute": "AGL",
    "status": "Provisional"
  },
  {
    "id": "TASK-ACROBATICS-CONTROLLED-FALL",
    "name": "Controlled Fall",
    "skillId": "SKL-ACROBATICS",
    "typicalAttribute": "AGL/HLT",
    "status": "Provisional"
  },
  {
    "id": "TASK-ACROBATICS-VAULT",
    "name": "Vault",
    "skillId": "SKL-ACROBATICS",
    "typicalAttribute": "AGL/STR",
    "status": "Provisional"
  },
  {
    "id": "TASK-ACROBATICS-RECOVER-BALANCE",
    "name": "Recover Balance",
    "skillId": "SKL-ACROBATICS",
    "typicalAttribute": "AGL/STR",
    "status": "Provisional"
  },
  {
    "id": "TASK-DODGE-EVADE",
    "name": "Dodge",
    "skillId": "SKL-DODGE",
    "typicalAttribute": "AGL",
    "status": "Active Working"
  },
  {
    "id": "TASK-RUNNING-SPRINT",
    "name": "Sprint",
    "skillId": "SKL-RUNNING",
    "typicalAttribute": "AGL",
    "status": "Provisional"
  },
  {
    "id": "TASK-AWARENESS-NOTICE",
    "name": "Notice",
    "skillId": "SKL-AWARENESS",
    "typicalAttribute": "INT",
    "status": "Provisional"
  },
  {
    "id": "TASK-OBSERVATION-SEARCH",
    "name": "Search",
    "skillId": "SKL-OBSERVATION",
    "typicalAttribute": "INT",
    "status": "Provisional"
  },
  {
    "id": "TASK-STEALTH-HIDE",
    "name": "Hide",
    "skillId": "SKL-STEALTH",
    "typicalAttribute": "AGL",
    "status": "Provisional"
  },
  {
    "id": "TASK-STEALTH-SNEAK",
    "name": "Sneak",
    "skillId": "SKL-STEALTH",
    "typicalAttribute": "AGL",
    "status": "Provisional"
  },
  {
    "id": "TASK-CONCEALMENT-CONCEAL",
    "name": "Conceal",
    "skillId": "SKL-CONCEALMENT",
    "typicalAttribute": "INT/AGL",
    "status": "Provisional"
  },
  {
    "id": "TASK-TACTICS-PREPARE-AMBUSH",
    "name": "Prepare Ambush",
    "skillId": "SKL-TACTICS",
    "typicalAttribute": "INT",
    "status": "Provisional"
  },
  {
    "id": "TASK-TACTICS-ANTICIPATE-AMBUSH",
    "name": "Anticipate Ambush",
    "skillId": "SKL-TACTICS",
    "typicalAttribute": "INT",
    "status": "Provisional"
  },
  {
    "id": "TASK-MEDICINE-FIRST-AID",
    "name": "First Aid",
    "skillId": "SKL-MEDICINE",
    "typicalAttribute": "INT",
    "status": "Active Working"
  },
  {
    "id": "TASK-PHYSICIAN-ATTENDING",
    "name": "Attending",
    "skillId": "SKL-PHYSICIAN",
    "typicalAttribute": "INT",
    "status": "Provisional"
  },
  {
    "id": "TASK-FLETCHER-FLETCH",
    "name": "Fletch",
    "skillId": "SKL-FLETCHER",
    "typicalAttribute": "INT",
    "status": "Active Working"
  },
  {
    "id": "TASK-FOCUS-EVALUATE",
    "name": "Evaluate",
    "skillId": "SKL-FOCUS",
    "typicalAttribute": "INT",
    "status": "Provisional"
  },
  {
    "id": "TASK-FOCUS-CENTER",
    "name": "Center",
    "skillId": "SKL-FOCUS",
    "typicalAttribute": "CHA",
    "status": "Provisional"
  },
  {
    "id": "TASK-FOCUS-CONVALESCE",
    "name": "Convalesce",
    "skillId": "SKL-FOCUS",
    "typicalAttribute": "HLT/ESS",
    "status": "Active Working"
  },
  {
    "id": "TASK-FOCUS-ADJUST-TRAIT",
    "name": "Adjust Trait",
    "skillId": "SKL-FOCUS",
    "typicalAttribute": "AGL",
    "status": "Active Working"
  },
  {
    "id": "TASK-FOCUS-TAKE-AIM",
    "name": "Take Aim",
    "skillId": "SKL-FOCUS",
    "typicalAttribute": "INT",
    "status": "Active Working"
  },
  {
    "id": "TASK-FOCUS-JUGGLE",
    "name": "Juggle",
    "skillId": "SKL-FOCUS",
    "typicalAttribute": "AGL",
    "status": "Active Working"
  }
];

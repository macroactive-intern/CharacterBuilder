export type SkillNode = {
  id: string;
  name: string;
  description: string;
  requires: string[];
};

export type SelectedSkills = readonly string[] | ReadonlySet<string>;

export const skillTree: SkillNode[] = [
  {
    id: "combat_basics",
    name: "Combat Basics",
    description: "Learn reliable footwork, timing, and weapon handling.",
    requires: [],
  },
  {
    id: "power_strike",
    name: "Power Strike",
    description: "Channel strength into a single decisive attack.",
    requires: ["combat_basics"],
  },
  {
    id: "shield_guard",
    name: "Shield Guard",
    description: "Brace against incoming attacks and protect nearby allies.",
    requires: ["combat_basics"],
  },
  {
    id: "weapon_mastery",
    name: "Weapon Mastery",
    description: "Combine offense and defense into fluid martial technique.",
    requires: ["power_strike", "shield_guard"],
  },
  {
    id: "arcane_basics",
    name: "Arcane Basics",
    description: "Understand spell focus, mana flow, and magical notation.",
    requires: [],
  },
  {
    id: "firebolt",
    name: "Firebolt",
    description: "Launch a focused spark of elemental flame.",
    requires: ["arcane_basics"],
  },
  {
    id: "mana_shield",
    name: "Mana Shield",
    description: "Shape raw mana into a temporary protective barrier.",
    requires: ["arcane_basics"],
  },
  {
    id: "elemental_focus",
    name: "Elemental Focus",
    description: "Stabilize elemental spells for stronger, safer casting.",
    requires: ["firebolt", "mana_shield"],
  },
  {
    id: "stealth_basics",
    name: "Stealth Basics",
    description: "Move quietly, hide effectively, and read patrol patterns.",
    requires: [],
  },
  {
    id: "backstab",
    name: "Backstab",
    description: "Strike exposed targets with precise close-range attacks.",
    requires: ["stealth_basics"],
  },
  {
    id: "evasion",
    name: "Evasion",
    description: "Slip past danger with quick reflexes and careful movement.",
    requires: ["stealth_basics"],
  },
  {
    id: "shadow_mastery",
    name: "Shadow Mastery",
    description: "Blend stealth and mobility into advanced ambush tactics.",
    requires: ["backstab", "evasion"],
  },
];

export const skillConfig = skillTree;

function toSelectedSet(selectedSkills: SelectedSkills) {
  return new Set(selectedSkills);
}

function getSkill(skillId: string) {
  return skillTree.find((skill) => skill.id === skillId);
}

function getDependentSkillIds(skillId: string) {
  return skillTree
    .filter((skill) => skill.requires.includes(skillId))
    .map((skill) => skill.id);
}

export function canSelectSkill(
  selectedSkills: SelectedSkills,
  skillId: string,
) {
  const selected = toSelectedSet(selectedSkills);
  const skill = getSkill(skillId);

  if (!skill || selected.has(skillId)) {
    return false;
  }

  return skill.requires.every((requiredSkillId) =>
    selected.has(requiredSkillId),
  );
}

export function addSkill(selectedSkills: SelectedSkills, skillId: string) {
  if (!canSelectSkill(selectedSkills, skillId)) {
    return Array.from(toSelectedSet(selectedSkills));
  }

  return [...Array.from(toSelectedSet(selectedSkills)), skillId];
}

export function removeSkill(selectedSkills: SelectedSkills, skillId: string) {
  const selected = toSelectedSet(selectedSkills);
  const skillsToRemove = new Set<string>();
  const queue = [skillId];

  while (queue.length > 0) {
    const currentSkillId = queue.shift();

    if (!currentSkillId || skillsToRemove.has(currentSkillId)) {
      continue;
    }

    skillsToRemove.add(currentSkillId);

    queue.push(...getDependentSkillIds(currentSkillId));
  }

  return Array.from(selected).filter(
    (selectedSkillId) => !skillsToRemove.has(selectedSkillId),
  );
}

export function getBlockedReason(
  skillId: string,
  selectedSkills: SelectedSkills = [],
) {
  const skill = getSkill(skillId);

  if (!skill) {
    return "Skill not found.";
  }

  const selected = toSelectedSet(selectedSkills);

  if (selected.has(skillId)) {
    return "Skill already selected.";
  }

  const missingSkills = skill.requires
    .filter((requiredSkillId) => !selected.has(requiredSkillId))
    .map((requiredSkillId) => getSkill(requiredSkillId)?.name ?? requiredSkillId);

  if (missingSkills.length === 0) {
    return null;
  }

  return `Requires ${missingSkills.join(", ")}.`;
}

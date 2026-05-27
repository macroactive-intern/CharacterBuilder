import type { StatName } from "@/lib/characterSchema";
import { skillTree } from "@/lib/skillTree";

export const statLabels: Record<StatName, string> = {
  strength: "Strength",
  intelligence: "Intelligence",
  agility: "Agility",
  vitality: "Vitality",
};

// Resolves stored skill IDs to human-readable display names
export function getSkillName(skillId: string): string {
  return skillTree.find((skill) => skill.id === skillId)?.name ?? skillId;
}

export function getStatValue(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function createSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "character"
  );
}

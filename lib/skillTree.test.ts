import { describe, expect, it } from "vitest";
import {
  addSkill,
  canSelectSkill,
  getBlockedReason,
  removeSkill,
  skillTree,
} from "./skillTree";

describe("skillTree", () => {
  it("defines 12 uniquely identified skills", () => {
    const ids = skillTree.map((skill) => skill.id);

    expect(skillTree).toHaveLength(12);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("allows root skills and blocks skills with missing prerequisites", () => {
    expect(canSelectSkill([], "combat_basics")).toBe(true);
    expect(canSelectSkill([], "power_strike")).toBe(false);
    expect(canSelectSkill(["combat_basics"], "power_strike")).toBe(true);
  });

  it("accepts readonly sets as selected skill input", () => {
    expect(canSelectSkill(new Set(["arcane_basics"]), "firebolt")).toBe(true);
  });

  it("does not select unknown, duplicate, or blocked skills", () => {
    expect(addSkill([], "unknown_skill")).toEqual([]);
    expect(addSkill(["combat_basics"], "combat_basics")).toEqual([
      "combat_basics",
    ]);
    expect(addSkill([], "power_strike")).toEqual([]);
  });

  it("adds an available skill after prerequisites are met", () => {
    expect(addSkill(["combat_basics"], "power_strike")).toEqual([
      "combat_basics",
      "power_strike",
    ]);
  });

  it("removes dependent children recursively when a prerequisite is removed", () => {
    const selectedSkills = [
      "combat_basics",
      "power_strike",
      "shield_guard",
      "weapon_mastery",
      "arcane_basics",
    ];

    expect(removeSkill(selectedSkills, "combat_basics")).toEqual([
      "arcane_basics",
    ]);
  });

  it("only removes dependents of the removed skill", () => {
    const selectedSkills = [
      "combat_basics",
      "power_strike",
      "shield_guard",
      "weapon_mastery",
    ];

    expect(removeSkill(selectedSkills, "power_strike")).toEqual([
      "combat_basics",
      "shield_guard",
    ]);
  });

  it("explains why a skill is blocked", () => {
    expect(getBlockedReason("unknown_skill")).toBe("Skill not found.");
    expect(getBlockedReason("combat_basics", ["combat_basics"])).toBe(
      "Skill already selected.",
    );
    expect(getBlockedReason("weapon_mastery", ["combat_basics"])).toBe(
      "Requires Power Strike, Shield Guard.",
    );
  });

  it("returns null when a skill is not blocked", () => {
    expect(getBlockedReason("weapon_mastery", ["power_strike", "shield_guard"]))
      .toBeNull();
  });
});

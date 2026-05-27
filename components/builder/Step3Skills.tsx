"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  addSkill,
  canSelectSkill,
  getBlockedReason,
  removeSkill,
  skillTree,
} from "@/lib/skillTree";

type Step3SkillsProps = {
  defaultValues?: string[];
  onSubmit?: (skills: string[]) => void;
};

type Feedback = {
  id: string;
  message: string;
  type: "blocked" | "selected" | "removed";
  version: number;
};

const maxSelectedSkills = 3;

function getSkillName(skillId: string) {
  return skillTree.find((skill) => skill.id === skillId)?.name ?? skillId;
}

function getPrerequisiteText(requires: string[]) {
  if (requires.length === 0) {
    return "No prerequisites";
  }

  return `Requires: ${requires.map(getSkillName).join(", ")}`;
}

export default function Step3Skills({
  defaultValues = [],
  onSubmit,
}: Step3SkillsProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(() =>
    Array.from(new Set(defaultValues)).slice(0, maxSelectedSkills),
  );
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const selectedSkillSet = useMemo(
    () => new Set(selectedSkills),
    [selectedSkills],
  );

  function setSkillFeedback(
    skillId: string,
    type: Feedback["type"],
    message: string,
  ) {
    setFeedback((currentFeedback) => ({
      id: skillId,
      message,
      type,
      version: (currentFeedback?.version ?? 0) + 1,
    }));
  }

  function handleSkillClick(skillId: string) {
    if (selectedSkillSet.has(skillId)) {
      const nextSkills = removeSkill(selectedSkills, skillId);
      const removedCount = selectedSkills.length - nextSkills.length;

      setSelectedSkills(nextSkills);
      setSkillFeedback(
        skillId,
        "removed",
        removedCount > 1
          ? `Removed ${getSkillName(skillId)} and ${removedCount - 1} dependent skill(s).`
          : `Removed ${getSkillName(skillId)}.`,
      );
      return;
    }

    const blockedReason = getBlockedReason(skillId, selectedSkills);

    if (blockedReason) {
      setSkillFeedback(skillId, "blocked", blockedReason);
      return;
    }

    if (selectedSkills.length >= maxSelectedSkills) {
      setSkillFeedback(
        skillId,
        "blocked",
        `Choose up to ${maxSelectedSkills} skills. Remove one before selecting another.`,
      );
      return;
    }

    if (!canSelectSkill(selectedSkills, skillId)) {
      setSkillFeedback(skillId, "blocked", "Select the required skills first.");
      return;
    }

    const nextSkills = addSkill(selectedSkills, skillId);

    setSelectedSkills(nextSkills);
    setSkillFeedback(skillId, "selected", `${getSkillName(skillId)} selected.`);
  }

  function handleSubmit() {
    onSubmit?.(selectedSkills);
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">Step 3</p>
          <h2 className="text-xl font-semibold text-slate-950">
            Choose skills
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Select up to {maxSelectedSkills} skills. Skills with prerequisites
            unlock only after their required skills are selected.
          </p>
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
          {selectedSkills.length}/{maxSelectedSkills} selected
        </div>
      </div>

      {feedback ? (
        <motion.p
          animate={{ opacity: 1, y: 0 }}
          className={[
            "mb-4 rounded-md border px-3 py-2 text-sm font-medium",
            feedback.type === "blocked"
              ? "border-red-200 bg-red-50 text-red-700"
              : "",
            feedback.type === "selected"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "",
            feedback.type === "removed"
              ? "border-slate-200 bg-slate-50 text-slate-700"
              : "",
          ].join(" ")}
          initial={{ opacity: 0, y: -4 }}
          key={feedback.version}
          role={feedback.type === "blocked" ? "alert" : "status"}
          transition={{ duration: 0.2 }}
        >
          {feedback.message}
        </motion.p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {skillTree.map((skill) => {
          const isSelected = selectedSkillSet.has(skill.id);
          const blockedReason = getBlockedReason(skill.id, selectedSkills);
          const isBlocked =
            !isSelected &&
            (Boolean(blockedReason) ||
              selectedSkills.length >= maxSelectedSkills ||
              !canSelectSkill(selectedSkills, skill.id));
          const title = [
            skill.description,
            getPrerequisiteText(skill.requires),
            isBlocked
              ? blockedReason ??
                `Maximum ${maxSelectedSkills} selected skills reached.`
              : null,
          ]
            .filter(Boolean)
            .join(" ");
          const feedbackType = feedback?.id === skill.id ? feedback.type : null;
          const animation =
            feedbackType === "blocked"
              ? { x: [0, -6, 6, -4, 4, 0] }
              : feedbackType === "selected"
                ? { scale: [1, 1.04, 1] }
                : { x: 0, scale: 1 };

          return (
            <motion.button
              animate={animation}
              aria-pressed={isSelected}
              className={[
                "flex min-h-44 flex-col rounded-lg border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
                isSelected
                  ? "border-emerald-500 bg-emerald-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300",
                isBlocked ? "cursor-pointer opacity-70" : "",
              ].join(" ")}
              key={skill.id}
              onClick={() => handleSkillClick(skill.id)}
              title={title}
              transition={{ duration: 0.25 }}
              type="button"
              whileHover={{ y: -2 }}
            >
              <span className="flex items-start justify-between gap-3">
                <span>
                  <span className="block text-base font-semibold text-slate-950">
                    {skill.name}
                  </span>
                  <span className="mt-1 block text-sm text-slate-600">
                    {skill.description}
                  </span>
                </span>

                <span
                  className={[
                    "shrink-0 rounded-full px-2 py-1 text-xs font-semibold",
                    isSelected
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600",
                  ].join(" ")}
                >
                  {isSelected ? "Selected" : "Skill"}
                </span>
              </span>

              <span className="mt-auto pt-4 text-sm text-slate-600">
                {getPrerequisiteText(skill.requires)}
              </span>

              {isBlocked ? (
                <span className="mt-2 text-sm font-medium text-red-600">
                  {blockedReason ??
                    `Maximum ${maxSelectedSkills} selected skills reached.`}
                </span>
              ) : null}
            </motion.button>
          );
        })}
      </div>

      <button
        className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        onClick={handleSubmit}
        type="button"
      >
        Save skills
      </button>
    </section>
  );
}

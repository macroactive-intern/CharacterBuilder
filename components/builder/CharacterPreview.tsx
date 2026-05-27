"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import {
  classBonusConfig,
  defaultCharacter,
  statNames,
  type CharacterInput,
  type StatName,
} from "@/lib/characterSchema";
import { skillTree } from "@/lib/skillTree";

type CharacterPreviewProps = {
  data?: Partial<CharacterInput>;
  selectedSkills?: string[];
};

const statLabels: Record<StatName, string> = {
  strength: "Strength",
  intelligence: "Intelligence",
  agility: "Agility",
  vitality: "Vitality",
};

function getSkillName(skillId: string) {
  return skillTree.find((skill) => skill.id === skillId)?.name ?? skillId;
}

function getStatValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function AnimatedValue({
  children,
  valueKey,
}: {
  children: ReactNode;
  valueKey: string | number;
}) {
  return (
    <motion.span
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0.55, y: 3 }}
      key={valueKey}
      transition={{ duration: 0.18 }}
    >
      {children}
    </motion.span>
  );
}

export default function CharacterPreview({
  data,
  selectedSkills = [],
}: CharacterPreviewProps) {
  const character = {
    ...defaultCharacter,
    ...data,
  };
  const classBonus = classBonusConfig[character.class];
  const selectedSkillNames = selectedSkills.map(getSkillName);

  return (
    <aside className="w-full lg:sticky lg:top-6 lg:self-start">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 text-white shadow-lg"
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25 }}
      >
        <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-slate-900 p-5">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-50">
            Character Preview
          </p>
          <h2 className="mt-3 text-2xl font-bold">
            <AnimatedValue valueKey={character.name}>
              {character.name || "Unnamed Hero"}
            </AnimatedValue>
          </h2>
          <p className="mt-1 text-sm font-medium text-emerald-50">
            <AnimatedValue valueKey={character.class}>
              {character.class}
            </AnimatedValue>
          </p>
        </div>

        <div className="space-y-5 p-5">
          <section>
            <h3 className="text-sm font-semibold uppercase text-slate-300">
              Stats
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {statNames.map((statName) => {
                const baseValue = getStatValue(character[statName]);
                const bonusValue =
                  statName === classBonus.stat ? classBonus.bonus : 0;
                const finalValue = baseValue + bonusValue;

                return (
                  <div
                    className={[
                      "rounded-md border p-3",
                      bonusValue > 0
                        ? "border-emerald-400 bg-emerald-400/10"
                        : "border-white/10 bg-white/5",
                    ].join(" ")}
                    key={statName}
                  >
                    <p className="text-xs text-slate-300">
                      {statLabels[statName]}
                    </p>
                    <p className="mt-1 text-xl font-bold">
                      <AnimatedValue valueKey={`${statName}-${finalValue}`}>
                        {finalValue}
                      </AnimatedValue>
                    </p>
                    {bonusValue > 0 ? (
                      <p className="mt-1 text-xs text-emerald-200">
                        {baseValue} + {bonusValue} class bonus
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase text-slate-300">
              Skills
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedSkillNames.length > 0 ? (
                selectedSkillNames.map((skillName) => (
                  <motion.span
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-medium text-emerald-100"
                    initial={{ opacity: 0, scale: 0.96 }}
                    key={skillName}
                    transition={{ duration: 0.18 }}
                  >
                    {skillName}
                  </motion.span>
                ))
              ) : (
                <p className="text-sm text-slate-400">No skills selected yet.</p>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase text-slate-300">
              Appearance
            </h3>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-slate-400">Hair</dt>
                <dd className="font-medium">
                  <AnimatedValue valueKey={character.hairColor}>
                    {character.hairColor || "Unset"}
                  </AnimatedValue>
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Eyes</dt>
                <dd className="font-medium">
                  <AnimatedValue valueKey={character.eyeColor}>
                    {character.eyeColor || "Unset"}
                  </AnimatedValue>
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Height</dt>
                <dd className="font-medium">
                  <AnimatedValue valueKey={character.height}>
                    {character.height || "Unset"}
                  </AnimatedValue>
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Motto</dt>
                <dd className="font-medium">
                  <AnimatedValue valueKey={character.motto}>
                    {character.motto || "Unset"}
                  </AnimatedValue>
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-md border border-white/10 bg-white/5 p-3">
            <h3 className="text-sm font-semibold uppercase text-slate-300">
              Backstory
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              <AnimatedValue valueKey={character.backstory}>
                {character.backstory || "No backstory added yet."}
              </AnimatedValue>
            </p>
          </section>
        </div>
      </motion.div>
    </aside>
  );
}

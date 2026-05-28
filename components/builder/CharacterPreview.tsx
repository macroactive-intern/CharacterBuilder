"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, type ReactNode } from "react";
import {
  classBonusConfig,
  defaultCharacter,
  statNames,
  type CharacterInput,
} from "@/lib/characterSchema";
import { getSkillName, getStatValue, statLabels } from "@/lib/characterUtils";

type CharacterPreviewProps = {
  data?: Partial<CharacterInput>;
  selectedSkills?: string[];
};

// Defined outside the component so it is not recreated on each render
function AnimatedValue({
  children,
  prefersReducedMotion,
  valueKey,
}: {
  children: ReactNode;
  prefersReducedMotion: boolean | null;
  valueKey: string | number;
}) {
  return (
    <motion.span
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      initial={prefersReducedMotion ? {} : { opacity: 0.55, y: 3 }}
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
  const prefersReducedMotion = useReducedMotion();

  // Avoid recomputing skill names on every render
  const selectedSkillNames = useMemo(
    () => selectedSkills.map(getSkillName),
    [selectedSkills],
  );

  return (
    <aside className="w-full lg:sticky lg:top-6 lg:self-start">
      <motion.div
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 text-white shadow-lg"
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
        transition={{ duration: 0.25 }}
      >
        <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-slate-900 p-5">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-50">
            Character Preview
          </p>
          <h2 className="mt-3 text-2xl font-bold">
            <AnimatedValue
              prefersReducedMotion={prefersReducedMotion}
              valueKey={character.name}
            >
              {character.name || "Unnamed Hero"}
            </AnimatedValue>
          </h2>
          <p className="mt-1 text-sm font-medium text-emerald-50">
            <AnimatedValue
              prefersReducedMotion={prefersReducedMotion}
              valueKey={character.class}
            >
              {character.class}
            </AnimatedValue>
          </p>
        </div>

        <div className="space-y-5 p-5">
          <section aria-label="Stats">
            <h3 className="text-sm font-semibold uppercase text-slate-300">
              Stats
            </h3>
            {/* dl/dt/dd for semantic name-value pairs */}
            <dl className="mt-3 grid grid-cols-2 gap-3">
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
                    <dt className="text-xs text-slate-300">
                      {statLabels[statName]}
                    </dt>
                    <dd className="mt-1 text-xl font-bold">
                      <AnimatedValue
                        prefersReducedMotion={prefersReducedMotion}
                        valueKey={`${statName}-${finalValue}`}
                      >
                        {finalValue}
                      </AnimatedValue>
                    </dd>
                    {bonusValue > 0 ? (
                      <p className="mt-1 text-xs text-emerald-200">
                        {baseValue} + {bonusValue} class bonus
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </dl>
          </section>

          <section aria-label="Skills">
            <h3 className="text-sm font-semibold uppercase text-slate-300">
              Skills
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedSkillNames.length > 0 ? (
                selectedSkillNames.map((skillName) => (
                  <motion.span
                    animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
                    className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-medium text-emerald-100"
                    initial={
                      prefersReducedMotion ? {} : { opacity: 0, scale: 0.96 }
                    }
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

          <section aria-label="Appearance">
            <h3 className="text-sm font-semibold uppercase text-slate-300">
              Appearance
            </h3>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-slate-400">Hair</dt>
                <dd className="font-medium">
                  <AnimatedValue
                    prefersReducedMotion={prefersReducedMotion}
                    valueKey={character.hairColor}
                  >
                    {character.hairColor || "Unset"}
                  </AnimatedValue>
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Eyes</dt>
                <dd className="font-medium">
                  <AnimatedValue
                    prefersReducedMotion={prefersReducedMotion}
                    valueKey={character.eyeColor}
                  >
                    {character.eyeColor || "Unset"}
                  </AnimatedValue>
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Height</dt>
                <dd className="font-medium">
                  <AnimatedValue
                    prefersReducedMotion={prefersReducedMotion}
                    valueKey={character.height}
                  >
                    {character.height || "Unset"}
                  </AnimatedValue>
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Motto</dt>
                <dd className="font-medium">
                  <AnimatedValue
                    prefersReducedMotion={prefersReducedMotion}
                    valueKey={character.motto}
                  >
                    {character.motto || "Unset"}
                  </AnimatedValue>
                </dd>
              </div>
            </dl>
          </section>

          <section
            aria-label="Backstory"
            className="rounded-md border border-white/10 bg-white/5 p-3"
          >
            <h3 className="text-sm font-semibold uppercase text-slate-300">
              Backstory
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              <AnimatedValue
                prefersReducedMotion={prefersReducedMotion}
                valueKey={character.backstory}
              >
                {character.backstory || "No backstory added yet."}
              </AnimatedValue>
            </p>
          </section>
        </div>
      </motion.div>
    </aside>
  );
}

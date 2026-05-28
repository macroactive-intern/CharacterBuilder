"use client";

import { useMemo } from "react";
import {
  characterSchema,
  classBonusConfig,
  defaultCharacter,
  statNames,
  type CharacterInput,
} from "@/lib/characterSchema";
import { getSkillName, getStatValue, statLabels } from "@/lib/characterUtils";
import SkillBadge from "@/components/ui/SkillBadge";

type Step5ReviewProps = {
  data?: Partial<CharacterInput>;
  isLoading?: boolean;
  onCreate?: () => void;
  selectedSkills?: string[];
  validationError?: string | string[] | null;
};

function normalizeErrors(error: Step5ReviewProps["validationError"]) {
  if (!error) {
    return [];
  }

  return Array.isArray(error) ? error : [error];
}

export default function Step5Review({
  data,
  isLoading = false,
  onCreate,
  selectedSkills = [],
  validationError,
}: Step5ReviewProps) {
  const character = useMemo(
    () => ({
      ...defaultCharacter,
      ...data,
    }),
    [data],
  );
  const validation = useMemo(
    () => characterSchema.safeParse(character),
    [character],
  );
  const hasSchemaErrors = !validation.success;
  const validationMessages = [
    ...normalizeErrors(validationError),
    ...(validation.success
      ? []
      : validation.error.issues.map((issue) => issue.message)),
  ];
  const classBonus = classBonusConfig[character.class];
  const selectedSkillNames = selectedSkills.map(getSkillName);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">Step 5</p>
          <h2 className="text-xl font-semibold text-slate-950">
            Review character
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Check the final details before creating your character.
          </p>
        </div>

        <button
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={isLoading || hasSchemaErrors}
          onClick={onCreate}
          type="button"
        >
          {isLoading ? "Creating..." : "Create character"}
        </button>
      </div>

      {validationMessages.length > 0 ? (
        <div
          className="mb-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          <p className="font-semibold">Resolve these issues first:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {validationMessages.map((message, index) => (
              <li key={`${message}-${index}`}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-md border border-slate-200 p-4">
          <h3 className="text-sm font-semibold uppercase text-slate-500">
            Identity
          </h3>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Name</dt>
              <dd className="font-medium text-slate-950">{character.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Class</dt>
              <dd className="font-medium text-slate-950">{character.class}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Backstory</dt>
              <dd className="leading-6 text-slate-800">{character.backstory}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-md border border-slate-200 p-4">
          <h3 className="text-sm font-semibold uppercase text-slate-500">
            Final stats
          </h3>
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
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-slate-200 bg-slate-50",
                  ].join(" ")}
                  key={statName}
                >
                  <dt className="text-xs text-slate-500">
                    {statLabels[statName]}
                  </dt>
                  <dd className="mt-1 text-xl font-bold text-slate-950">
                    {finalValue}
                  </dd>
                  <p className="mt-1 text-xs text-slate-600">
                    Base {baseValue}
                    {bonusValue > 0 ? ` + ${bonusValue} class bonus` : ""}
                  </p>
                </div>
              );
            })}
          </dl>
        </section>

        <section className="rounded-md border border-slate-200 p-4">
          <h3 className="text-sm font-semibold uppercase text-slate-500">
            Skills
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedSkillNames.length > 0 ? (
              selectedSkillNames.map((skillName) => (
                <SkillBadge key={skillName} name={skillName} />
              ))
            ) : (
              <p className="text-sm text-slate-500">No skills selected.</p>
            )}
          </div>
        </section>

        <section className="rounded-md border border-slate-200 p-4">
          <h3 className="text-sm font-semibold uppercase text-slate-500">
            Appearance
          </h3>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-500">Hair color</dt>
              <dd className="font-medium text-slate-950">
                {character.hairColor}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Eye color</dt>
              <dd className="font-medium text-slate-950">
                {character.eyeColor}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Height</dt>
              <dd className="font-medium text-slate-950">
                {character.height}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Motto</dt>
              <dd className="font-medium text-slate-950">
                {character.motto || "No motto"}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </section>
  );
}

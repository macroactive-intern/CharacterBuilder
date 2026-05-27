"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  classBonusConfig,
  statNames,
  step2Schema,
  type CharacterClass,
  type StatName,
  type Step2Character,
} from "@/lib/characterSchema";

type Step2StatsProps = {
  characterClass?: CharacterClass;
  defaultValues?: Partial<Step2Character>;
  onSubmit?: (data: Step2Character) => void;
};

const maxStatTotal = 50;

const defaultStepValues: Step2Character = {
  strength: 10,
  intelligence: 10,
  agility: 10,
  vitality: 10,
};

const statLabels: Record<StatName, string> = {
  strength: "Strength",
  intelligence: "Intelligence",
  agility: "Agility",
  vitality: "Vitality",
};

function getStatValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export default function Step2Stats({
  characterClass = "Warrior",
  defaultValues,
  onSubmit,
}: Step2StatsProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    watch,
  } = useForm<Step2Character>({
    defaultValues: {
      ...defaultStepValues,
      ...defaultValues,
    },
    mode: "onChange",
    resolver: zodResolver(step2Schema),
  });
  const watchedStats = watch();
  const classBonus = classBonusConfig[characterClass];
  const baseTotal = statNames.reduce(
    (total, statName) => total + getStatValue(watchedStats[statName]),
    0,
  );
  const remainingPoints = maxStatTotal - baseTotal;
  const isOverBudget = remainingPoints < 0;
  const bonusAdjustedStats = useMemo(
    () =>
      statNames.reduce(
        (stats, statName) => ({
          ...stats,
          [statName]:
            getStatValue(watchedStats[statName]) +
            (statName === classBonus.stat ? classBonus.bonus : 0),
        }),
        {} as Record<StatName, number>,
      ),
    [classBonus.bonus, classBonus.stat, watchedStats],
  );

  function handleValidSubmit(data: Step2Character) {
    onSubmit?.(data);
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">Step 2</p>
          <h2 className="text-xl font-semibold text-slate-950">
            Assign base stats
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Spend up to 50 base points. {characterClass} automatically adds +
            {classBonus.bonus} {statLabels[classBonus.stat]} after validation.
          </p>
        </div>

        <div
          className={[
            "rounded-md border px-3 py-2 text-sm font-semibold",
            isOverBudget
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700",
          ].join(" ")}
        >
          {remainingPoints} points remaining
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(handleValidSubmit)}>
        <div className="grid gap-4 sm:grid-cols-2">
          {statNames.map((statName) => {
            const isBonusStat = statName === classBonus.stat;
            const error = errors[statName];

            return (
              <div
                className={[
                  "rounded-md border p-4 transition",
                  isBonusStat
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-slate-200 bg-white",
                ].join(" ")}
                key={statName}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    className="text-sm font-medium text-slate-800"
                    htmlFor={statName}
                  >
                    {statLabels[statName]}
                  </label>
                  {isBonusStat ? (
                    <span className="rounded-full bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">
                      +{classBonus.bonus} bonus
                    </span>
                  ) : null}
                </div>

                <input
                  aria-describedby={`${statName}-hint`}
                  className={[
                    "w-full rounded-md border px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100",
                    isBonusStat
                      ? "border-emerald-300 bg-emerald-100"
                      : "border-slate-300 bg-white",
                  ].join(" ")}
                  id={statName}
                  max={20}
                  min={1}
                  readOnly={isBonusStat}
                  type="number"
                  {...register(statName, { valueAsNumber: true })}
                />

                <p className="mt-2 text-sm text-slate-600" id={`${statName}-hint`}>
                  Final: {bonusAdjustedStats[statName]}
                  {isBonusStat ? " after class bonus" : ""}
                </p>

                {error ? (
                  <p className="mt-2 text-sm text-red-600">{error.message}</p>
                ) : null}
              </div>
            );
          })}
        </div>

        {isOverBudget ? (
          <p className="text-sm font-medium text-red-600">
            Reduce your base stats to 50 points or fewer before class bonuses.
          </p>
        ) : null}

        <button
          className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          type="submit"
        >
          Save stats
        </button>
      </form>
    </section>
  );
}

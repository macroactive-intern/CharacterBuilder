"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  characterClasses,
  classBonusConfig,
  step1Schema,
  type Step1Character,
} from "@/lib/characterSchema";
import FieldError from "@/components/ui/FieldError";

type Step1ClassProps = {
  defaultValues?: Partial<Step1Character>;
  onChange?: (data: Partial<Step1Character>) => void;
  onSubmit?: (data: Step1Character) => void;
};

const defaultStepValues: Step1Character = {
  name: "",
  class: "Warrior",
  backstory: "",
};

function formatStatName(stat: string) {
  return stat.charAt(0).toUpperCase() + stat.slice(1);
}

export default function Step1Class({
  defaultValues,
  onChange,
  onSubmit,
}: Step1ClassProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    watch,
  } = useForm<Step1Character>({
    defaultValues: {
      ...defaultStepValues,
      ...defaultValues,
    },
    resolver: zodResolver(step1Schema),
  });
  const selectedClass = watch("class", defaultStepValues.class);
  const selectedBonus = classBonusConfig[selectedClass];
  const classBonusText = characterClasses
    .map((characterClass) => {
      const bonus = classBonusConfig[characterClass];

      return `${characterClass}: +${bonus.bonus} ${formatStatName(bonus.stat)}`;
    })
    .join(" | ");

  useEffect(() => {
    const subscription = watch((values) => {
      onChange?.(values as Partial<Step1Character>);
    });

    return () => subscription.unsubscribe();
  }, [onChange, watch]);

  function handleValidSubmit(data: Step1Character) {
    onSubmit?.(data);
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-medium text-emerald-700">Step 1</p>
        <h2 className="text-xl font-semibold text-slate-950">
          Choose your class
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Each class adds a +3 bonus after base stats are validated.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(handleValidSubmit)}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800" htmlFor="name">
            Name
          </label>
          <input
            aria-describedby={errors.name ? "name-error" : undefined}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            id="name"
            placeholder="Astra Vale"
            type="text"
            {...register("name")}
          />
          <FieldError message={errors.name?.message} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800" htmlFor="class">
            Class
          </label>
          <select
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            id="class"
            {...register("class")}
          >
            {characterClasses.map((characterClass) => (
              <option key={characterClass} value={characterClass}>
                {characterClass}
              </option>
            ))}
          </select>
          <FieldError message={errors.class?.message} />
          <p className="text-sm text-slate-600">
            {selectedClass} gains +{selectedBonus.bonus}{" "}
            {formatStatName(selectedBonus.stat)}.
          </p>
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-slate-800"
            htmlFor="backstory"
          >
            Backstory
          </label>
          <textarea
            className="min-h-32 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            id="backstory"
            placeholder="Tell us where this character begins."
            {...register("backstory")}
          />
          <FieldError message={errors.backstory?.message} />
        </div>

        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950">
          {classBonusText}
        </div>

        <button
          className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          type="submit"
        >
          Save class
        </button>
      </form>
    </section>
  );
}

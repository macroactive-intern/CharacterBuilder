"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { step4Schema, type Step4Character } from "@/lib/characterSchema";

type Step4AppearanceProps = {
  defaultValues?: Partial<Step4Character>;
  onChange?: (data: Partial<Step4Character>) => void;
  onSubmit?: (data: Step4Character) => void;
};

const mottoMaxLength = 50;

const defaultStepValues: Step4Character = {
  hairColor: "",
  eyeColor: "",
  height: "",
  motto: "",
};

export default function Step4Appearance({
  defaultValues,
  onChange,
  onSubmit,
}: Step4AppearanceProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    watch,
  } = useForm<Step4Character>({
    defaultValues: {
      ...defaultStepValues,
      ...defaultValues,
    },
    mode: "onChange",
    resolver: zodResolver(step4Schema),
  });
  const motto = watch("motto", "");
  const mottoLength = motto.length;

  useEffect(() => {
    const subscription = watch((values) => {
      onChange?.(values as Partial<Step4Character>);
    });

    return () => subscription.unsubscribe();
  }, [onChange, watch]);

  function handleValidSubmit(data: Step4Character) {
    onSubmit?.(data);
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-medium text-emerald-700">Step 4</p>
        <h2 className="text-xl font-semibold text-slate-950">
          Define appearance
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Add the visual details and a short motto for your character sheet.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(handleValidSubmit)}>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-800"
              htmlFor="hairColor"
            >
              Hair color
            </label>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              id="hairColor"
              placeholder="Silver"
              type="text"
              {...register("hairColor")}
            />
            {errors.hairColor ? (
              <p className="text-sm text-red-600">
                {errors.hairColor.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-800"
              htmlFor="eyeColor"
            >
              Eye color
            </label>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              id="eyeColor"
              placeholder="Amber"
              type="text"
              {...register("eyeColor")}
            />
            {errors.eyeColor ? (
              <p className="text-sm text-red-600">{errors.eyeColor.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-800"
              htmlFor="height"
            >
              Height
            </label>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              id="height"
              placeholder="5'10&quot;"
              type="text"
              {...register("height")}
            />
            {errors.height ? (
              <p className="text-sm text-red-600">{errors.height.message}</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label
              className="text-sm font-medium text-slate-800"
              htmlFor="motto"
            >
              Motto
            </label>
            <span
              className={[
                "text-xs font-medium",
                mottoLength > mottoMaxLength ? "text-red-600" : "text-slate-500",
              ].join(" ")}
            >
              {mottoLength}/{mottoMaxLength}
            </span>
          </div>
          <textarea
            className="min-h-24 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            id="motto"
            maxLength={mottoMaxLength}
            placeholder="No shadow without light."
            {...register("motto")}
          />
          {errors.motto ? (
            <p className="text-sm text-red-600">{errors.motto.message}</p>
          ) : null}
        </div>

        <button
          className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          type="submit"
        >
          Save appearance
        </button>
      </form>
    </section>
  );
}

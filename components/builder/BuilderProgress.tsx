"use client";

import { motion } from "framer-motion";

type BuilderProgressProps = {
  currentStep: number;
};

const steps = ["Class", "Stats", "Skills", "Appearance", "Review"];

function clampStep(step: number) {
  return Math.min(Math.max(step, 1), steps.length);
}

export default function BuilderProgress({ currentStep }: BuilderProgressProps) {
  const activeStep = clampStep(currentStep);
  const progress = ((activeStep - 1) / (steps.length - 1)) * 100;

  return (
    <nav aria-label="Builder progress" className="mt-6 w-full">
      <div className="relative px-2 py-3 sm:px-4">
        <div className="absolute left-6 right-6 top-7 h-1 rounded-full bg-slate-200 sm:left-10 sm:right-10" />
        <motion.div
          aria-hidden="true"
          animate={{ scaleX: progress / 100 }}
          className="absolute left-6 right-6 top-7 h-1 origin-left rounded-full bg-emerald-500 sm:left-10 sm:right-10"
          initial={false}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />

        <ol className="relative grid grid-cols-5 gap-2">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isComplete = stepNumber < activeStep;
            const isActive = stepNumber === activeStep;

            return (
              <li
                aria-current={isActive ? "step" : undefined}
                className="flex min-w-0 flex-col items-center gap-2 text-center"
                key={step}
              >
                <span
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                    isActive
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                      : "",
                    isComplete
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "",
                    !isActive && !isComplete
                      ? "border-slate-300 bg-white text-slate-500"
                      : "",
                  ].join(" ")}
                >
                  {stepNumber}
                </span>
                <span
                  className={[
                    "w-full truncate text-xs font-medium sm:text-sm",
                    isActive ? "text-slate-950" : "text-slate-500",
                  ].join(" ")}
                >
                  {step}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

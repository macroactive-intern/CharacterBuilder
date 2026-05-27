"use client";

import { AnimatePresence, motion } from "framer-motion";
import BuilderProgress from "@/components/builder/BuilderProgress";
import CharacterPreview from "@/components/builder/CharacterPreview";
import Step1Class from "@/components/builder/Step1Class";
import Step2Stats from "@/components/builder/Step2Stats";
import Step3Skills from "@/components/builder/Step3Skills";
import Step4Appearance from "@/components/builder/Step4Appearance";
import Step5Review from "@/components/builder/Step5Review";
import { useCharacterBuilder } from "@/hooks/useCharacterBuilder";
import {
  defaultCharacter,
  type CharacterClass,
  type Step1Character,
  type Step2Character,
  type Step4Character,
} from "@/lib/characterSchema";

const stepVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 48 : -48,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -48 : 48,
  }),
};

export default function BuilderPage() {
  const {
    currentStep,
    formData,
    isSubmitting,
    nextStep,
    prevStep,
    stepDirection,
    submitCharacter,
    submitError,
    updateData,
  } = useCharacterBuilder();
  const characterClass =
    (formData.class as CharacterClass | undefined) ?? defaultCharacter.class;
  const selectedSkills = formData.skills ?? [];

  function saveStep1(data: Step1Character) {
    updateData(data);
    nextStep();
  }

  function saveStep2(data: Step2Character) {
    updateData(data);
    nextStep();
  }

  function saveStep3(skills: string[]) {
    updateData({ skills });
    nextStep();
  }

  function saveStep4(data: Step4Character) {
    updateData(data);
    nextStep();
  }

  function renderStep() {
    switch (currentStep) {
      case 1:
        return (
          <Step1Class
            defaultValues={formData}
            onChange={updateData}
            onSubmit={saveStep1}
          />
        );
      case 2:
        return (
          <Step2Stats
            characterClass={characterClass}
            defaultValues={formData}
            onChange={updateData}
            onSubmit={saveStep2}
          />
        );
      case 3:
        return (
          <Step3Skills
            defaultValues={selectedSkills}
            onChange={(skills) => updateData({ skills })}
            onSubmit={saveStep3}
          />
        );
      case 4:
        return (
          <Step4Appearance
            defaultValues={formData}
            onChange={updateData}
            onSubmit={saveStep4}
          />
        );
      case 5:
        return (
          <Step5Review
            data={formData}
            isLoading={isSubmitting}
            onCreate={submitCharacter}
            selectedSkills={selectedSkills}
            validationError={submitError}
          />
        );
      default:
        return null;
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-sm font-medium text-emerald-700">
            Character Builder
          </p>
          <h1 className="text-3xl font-bold text-slate-950">
            Build your adventurer
          </h1>
        </div>

        <BuilderProgress currentStep={currentStep} />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="min-w-0">
            <AnimatePresence custom={stepDirection} mode="wait">
              <motion.div
                animate="center"
                custom={stepDirection}
                exit="exit"
                initial="enter"
                key={currentStep}
                transition={{ duration: 0.28, ease: "easeOut" }}
                variants={stepVariants}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={currentStep === 1}
                onClick={prevStep}
                type="button"
              >
                Back
              </button>

              <button
                className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={currentStep === 5}
                onClick={nextStep}
                type="button"
              >
                Next
              </button>
            </div>
          </div>

          <CharacterPreview data={formData} selectedSkills={selectedSkills} />
        </div>
      </div>
    </main>
  );
}

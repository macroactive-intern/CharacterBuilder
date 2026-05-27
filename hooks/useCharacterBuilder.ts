"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  characterSchema,
  defaultCharacter,
  type CharacterInput,
} from "@/lib/characterSchema";
import {
  clearDraft,
  loadDraft,
  saveDraft,
  type CharacterData,
} from "@/lib/characterStorage";

export type StepDirection = 1 | -1;

export const FIRST_STEP = 1;
export const LAST_STEP = 5;

function clampStep(step: number) {
  return Math.min(Math.max(step, FIRST_STEP), LAST_STEP);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export function useCharacterBuilder() {
  const router = useRouter();
  const form = useForm<CharacterInput>({
    defaultValues: defaultCharacter,
  });
  const { getValues, reset, watch } = form;
  const [currentStep, setCurrentStep] = useState(FIRST_STEP);
  const [stepDirection, setStepDirection] = useState<StepDirection>(1);
  const [formData, setFormData] =
    useState<Partial<CharacterData>>(defaultCharacter);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  useEffect(() => {
    const draft = loadDraft();

    if (draft) {
      const restoredData = {
        ...defaultCharacter,
        ...draft.data,
      };

      setCurrentStep(clampStep(draft.step));
      setFormData(restoredData);
      reset(restoredData);
    }

    setHasRestoredDraft(true);
  }, [reset]);

  useEffect(() => {
    const subscription = watch((values) => {
      setFormData(values as Partial<CharacterData>);
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    if (!hasRestoredDraft) {
      return;
    }

    saveDraft({
      step: currentStep,
      data: formData,
    });
  }, [currentStep, formData, hasRestoredDraft]);

  const goToStep = useCallback((step: number) => {
    setCurrentStep((previousStep) => {
      const nextStep = clampStep(step);

      if (nextStep !== previousStep) {
        setStepDirection(nextStep > previousStep ? 1 : -1);
      }

      return nextStep;
    });
  }, []);

  const nextStep = useCallback(() => {
    setStepDirection(1);
    setCurrentStep((step) => clampStep(step + 1));
  }, []);

  const prevStep = useCallback(() => {
    setStepDirection(-1);
    setCurrentStep((step) => clampStep(step - 1));
  }, []);

  const updateData = useCallback(
    (updates: Partial<CharacterData>) => {
      const nextData = {
        ...getValues(),
        ...updates,
      };

      reset(nextData);
      setFormData(nextData);
    },
    [getValues, reset],
  );

  const submitCharacter = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const latestData = {
        ...formData,
        ...getValues(),
      };
      const parsedCharacter = characterSchema.safeParse(latestData);

      if (!parsedCharacter.success) {
        throw new Error("Please complete all required character details.");
      }

      const response = await fetch("/api/characters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(latestData),
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;

        throw new Error(result?.error ?? "Character submission failed.");
      }

      clearDraft();
      router.push("/builder/success");

      return true;
    } catch (error) {
      setSubmitError(getErrorMessage(error));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, getValues, router]);

  return useMemo(
    () => ({
      form,
      formData,
      currentStep,
      step: currentStep,
      stepDirection,
      isSubmitting,
      submitError,
      setStep: goToStep,
      nextStep,
      prevStep,
      updateData,
      submitCharacter,
    }),
    [
      currentStep,
      form,
      formData,
      goToStep,
      isSubmitting,
      nextStep,
      prevStep,
      stepDirection,
      submitCharacter,
      submitError,
      updateData,
    ],
  );
}

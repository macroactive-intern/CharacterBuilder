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

function parseUrlStep() {
  if (typeof window === "undefined") {
    return null;
  }

  const stepParam = new URLSearchParams(window.location.search).get("step");

  if (stepParam === null) {
    return null;
  }

  const step = Number(stepParam);

  if (!Number.isInteger(step) || step < FIRST_STEP || step > LAST_STEP) {
    return undefined;
  }

  return step;
}

function syncStepUrl(step: number, mode: "push" | "replace") {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.set("step", String(clampStep(step)));

  if (mode === "replace") {
    window.history.replaceState(null, "", url);
    return;
  }

  window.history.pushState(null, "", url);
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
    const parsedStep = parseUrlStep();
    const isInvalidUrlStep = parsedStep === undefined;
    const restoredStep = draft ? clampStep(draft.step) : FIRST_STEP;
    const initialStep =
      parsedStep === null
        ? restoredStep
        : isInvalidUrlStep
          ? FIRST_STEP
          : parsedStep;

    if (draft) {
      const restoredData = {
        ...defaultCharacter,
        ...draft.data,
      };

      setFormData(restoredData);
      reset(restoredData);
    }

    setCurrentStep(initialStep);
    syncStepUrl(initialStep, "replace");
    setHasRestoredDraft(true);
  }, [reset]);

  useEffect(() => {
    function handlePopState() {
      const parsedStep = parseUrlStep();
      const nextStep = parsedStep ?? FIRST_STEP;

      if (parsedStep === null || parsedStep === undefined) {
        syncStepUrl(nextStep, "replace");
      }

      setCurrentStep((previousStep) => {
        if (nextStep !== previousStep) {
          setStepDirection(nextStep > previousStep ? 1 : -1);
        }

        return nextStep;
      });
    }

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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
        syncStepUrl(nextStep, "push");
      }

      return nextStep;
    });
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((step) => {
      const nextStepValue = clampStep(step + 1);

      if (nextStepValue !== step) {
        setStepDirection(1);
        syncStepUrl(nextStepValue, "push");
      }

      return nextStepValue;
    });
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((step) => {
      const nextStepValue = clampStep(step - 1);

      if (nextStepValue !== step) {
        setStepDirection(-1);
        syncStepUrl(nextStepValue, "push");
      }

      return nextStepValue;
    });
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

      const result = (await response.json()) as {
        id?: string;
        slug?: string;
      };

      if (!result.id) {
        throw new Error("Character was saved, but no id was returned.");
      }

      clearDraft();
      router.push(`/builder/success?id=${encodeURIComponent(result.id)}`);

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

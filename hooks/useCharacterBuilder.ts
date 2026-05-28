"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  characterInputSchema,
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
import { createSlug } from "@/lib/characterUtils";

export type StepDirection = 1 | -1;

export const FIRST_STEP = 1;
export const LAST_STEP = 5;
const DRAFT_SAVE_DEBOUNCE_MS = 300;

type UrlStepResult =
  | { type: "absent" }
  | { type: "invalid" }
  | { step: number; type: "valid" };

function clampStep(step: number) {
  return Math.min(Math.max(step, FIRST_STEP), LAST_STEP);
}

function parseUrlStep(): UrlStepResult {
  if (typeof window === "undefined") {
    return { type: "absent" };
  }

  const stepParam = new URLSearchParams(window.location.search).get("step");

  if (stepParam === null) {
    return { type: "absent" };
  }

  const step = Number(stepParam);

  if (!Number.isInteger(step) || step < FIRST_STEP || step > LAST_STEP) {
    return { type: "invalid" };
  }

  return { step, type: "valid" };
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

function createDownloadName(name: string) {
  return `${createSlug(name)}-builder-export.json`;
}

function getImportCandidate(value: unknown) {
  if (typeof value !== "object" || value === null) {
    return value;
  }

  if ("character" in value) {
    return value.character;
  }

  if ("data" in value) {
    return value.data;
  }

  return value;
}

function getImportStep(value: unknown) {
  if (typeof value !== "object" || value === null || !("step" in value)) {
    return null;
  }

  const step = Number(value.step);

  return Number.isInteger(step) ? clampStep(step) : null;
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
  const [importExportMessage, setImportExportMessage] = useState<string | null>(
    null,
  );
  const [importExportError, setImportExportError] = useState<string | null>(
    null,
  );
  const [importVersion, setImportVersion] = useState(0);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  useEffect(() => {
    const draft = loadDraft();
    const parsedStep = parseUrlStep();
    const restoredStep = draft ? clampStep(draft.step) : FIRST_STEP;
    const initialStep =
      parsedStep.type === "absent"
        ? restoredStep
        : parsedStep.type === "invalid"
          ? FIRST_STEP
          : parsedStep.step;

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
      const nextStep =
        parsedStep.type === "valid" ? parsedStep.step : FIRST_STEP;

      if (parsedStep.type !== "valid") {
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

    const timeoutId = window.setTimeout(() => {
      saveDraft({
        step: currentStep,
        data: formData,
      });
    }, DRAFT_SAVE_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
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

  const exportCharacter = useCallback(() => {
    setImportExportError(null);
    setImportExportMessage(null);

    const latestData = {
      ...defaultCharacter,
      ...formData,
      ...getValues(),
    };
    const parsedCharacter = characterInputSchema.safeParse(latestData);

    if (!parsedCharacter.success) {
      setImportExportError(
        "Complete the required character details before exporting.",
      );
      return false;
    }

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      step: currentStep,
      type: "character-builder.character",
      version: 1,
      character: parsedCharacter.data,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = createDownloadName(parsedCharacter.data.name);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setImportExportMessage("Character export downloaded.");

    return true;
  }, [currentStep, formData, getValues]);

  const importCharacter = useCallback(
    (jsonText: string) => {
      setImportExportError(null);
      setImportExportMessage(null);

      let parsedJson: unknown;

      try {
        parsedJson = JSON.parse(jsonText);
      } catch {
        setImportExportError("Invalid JSON. Check the pasted character data.");
        return false;
      }

      const parsedCharacter = characterInputSchema.safeParse(
        getImportCandidate(parsedJson),
      );

      if (!parsedCharacter.success) {
        setImportExportError(
          parsedCharacter.error.issues[0]?.message ??
            "Imported character data is invalid.",
        );
        return false;
      }

      reset(parsedCharacter.data);
      setFormData(parsedCharacter.data);
      const importedStep = getImportStep(parsedJson);

      if (importedStep) {
        setCurrentStep((previousStep) => {
          if (importedStep !== previousStep) {
            setStepDirection(importedStep > previousStep ? 1 : -1);
          }

          return importedStep;
        });
        syncStepUrl(importedStep, "replace");
      }

      saveDraft({
        step: importedStep ?? currentStep,
        data: parsedCharacter.data,
      });
      setImportVersion((version) => version + 1);
      setImportExportMessage("Character import restored into the builder.");

      return true;
    },
    [currentStep, reset],
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
      stepDirection,
      isSubmitting,
      importCharacter,
      importExportError,
      importExportMessage,
      importVersion,
      submitError,
      exportCharacter,
      setStep: goToStep,
      nextStep,
      prevStep,
      updateData,
      submitCharacter,
    }),
    [
      currentStep,
      formData,
      goToStep,
      importCharacter,
      importExportError,
      importExportMessage,
      importVersion,
      isSubmitting,
      nextStep,
      prevStep,
      stepDirection,
      submitCharacter,
      submitError,
      updateData,
      exportCharacter,
    ],
  );
}

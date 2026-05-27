"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { defaultCharacter, type Character } from "@/lib/characterSchema";

export function useCharacterBuilder() {
  const [step, setStep] = useState(1);
  const form = useForm<Character>({
    defaultValues: defaultCharacter,
  });

  return useMemo(
    () => ({
      form,
      step,
      setStep,
    }),
    [form, step],
  );
}

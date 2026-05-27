import { z } from "zod";

export const characterClasses = ["Warrior", "Mage", "Rogue", "Ranger"] as const;

export const statNames = [
  "strength",
  "intelligence",
  "agility",
  "vitality",
] as const;

export type CharacterClass = (typeof characterClasses)[number];
export type StatName = (typeof statNames)[number];

export const classBonusConfig = {
  Warrior: {
    stat: "strength",
    bonus: 3,
  },
  Mage: {
    stat: "intelligence",
    bonus: 3,
  },
  Rogue: {
    stat: "agility",
    bonus: 3,
  },
  Ranger: {
    stat: "vitality",
    bonus: 3,
  },
} as const satisfies Record<CharacterClass, { stat: StatName; bonus: number }>;

const statSchema = z
  .number()
  .int("Stats must be whole numbers.")
  .min(1, "Stats must be at least 1.")
  .max(20, "Stats must be 20 or fewer.");

export const step1Schema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(40, "Name must be 40 characters or fewer."),
  class: z.enum(characterClasses),
  backstory: z
    .string()
    .min(10, "Backstory must be at least 10 characters.")
    .max(200, "Backstory must be 200 characters or fewer."),
});

const step2BaseSchema = z.object({
  strength: statSchema,
  intelligence: statSchema,
  agility: statSchema,
  vitality: statSchema,
});

function hasValidBaseStatTotal(stats: z.infer<typeof step2BaseSchema>) {
  return (
    stats.strength + stats.intelligence + stats.agility + stats.vitality <= 50
  );
}

export const step2Schema = step2BaseSchema.refine(hasValidBaseStatTotal, {
  message: "Total stats must be 50 or less before class bonus.",
  path: ["strength"],
});

export const step3Schema = z.object({
  skills: z
    .array(z.string())
    .max(3, "Choose up to 3 skills.")
    .default([]),
});

export const step4Schema = z.object({
  hairColor: z
    .string()
    .min(2, "Hair color must be at least 2 characters.")
    .max(30, "Hair color must be 30 characters or fewer."),
  eyeColor: z
    .string()
    .min(2, "Eye color must be at least 2 characters.")
    .max(30, "Eye color must be 30 characters or fewer."),
  height: z
    .string()
    .min(2, "Height is required.")
    .max(20, "Height must be 20 characters or fewer."),
  motto: z.string().max(50, "Motto must be 50 characters or fewer."),
});

export const characterInputSchema = z
  .object({
    ...step1Schema.shape,
    ...step2BaseSchema.shape,
    ...step3Schema.shape,
    ...step4Schema.shape,
  })
  .refine(hasValidBaseStatTotal, {
    message: "Total stats must be 50 or less before class bonus.",
    path: ["strength"],
  });

export const characterSchema = characterInputSchema.transform((character) => {
  switch (character.class) {
    case "Warrior":
      return {
        ...character,
        strength: character.strength + classBonusConfig.Warrior.bonus,
      };
    case "Mage":
      return {
        ...character,
        intelligence: character.intelligence + classBonusConfig.Mage.bonus,
      };
    case "Rogue":
      return {
        ...character,
        agility: character.agility + classBonusConfig.Rogue.bonus,
      };
    case "Ranger":
      return {
        ...character,
        vitality: character.vitality + classBonusConfig.Ranger.bonus,
      };
  }
});

export const schemas = {
  step1: step1Schema,
  step2: step2Schema,
  step3: step3Schema,
  step4: step4Schema,
  characterInput: characterInputSchema,
  character: characterSchema,
};

export type Step1Character = z.infer<typeof step1Schema>;
export type Step2Character = z.infer<typeof step2Schema>;
export type Step3Character = z.infer<typeof step3Schema>;
export type Step4Character = z.infer<typeof step4Schema>;
export type CharacterInput = z.infer<typeof characterInputSchema>;
export type Character = z.infer<typeof characterSchema>;

export const defaultCharacter: CharacterInput = {
  name: "New Character",
  class: "Warrior",
  backstory: "A new adventurer begins their journey.",
  strength: 10,
  intelligence: 10,
  agility: 10,
  vitality: 10,
  hairColor: "Brown",
  eyeColor: "Green",
  height: "5'10\"",
  motto: "",
  skills: [],
};

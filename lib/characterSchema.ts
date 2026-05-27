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

const statSchema = z.number().int().min(1).max(20);

export const step1Schema = z.object({
  name: z.string().min(2).max(40),
  class: z.enum(characterClasses),
  backstory: z.string().min(10).max(200),
});

export const step2Schema = z
  .object({
    strength: statSchema,
    intelligence: statSchema,
    agility: statSchema,
    vitality: statSchema,
  })
  .refine(
    (stats) =>
      stats.strength + stats.intelligence + stats.agility + stats.vitality <= 50,
    {
      message: "Total stats must be 50 or less before class bonus.",
      path: ["strength"],
    },
  );

export const step3Schema = z.object({});

export const step4Schema = z.object({});

export const characterSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .transform((character) => {
    switch (character.class) {
      case "Warrior":
        return {
          ...character,
          strength: character.strength + classBonusConfig.Warrior.bonus,
        };
      case "Mage":
        return {
          ...character,
          intelligence:
            character.intelligence + classBonusConfig.Mage.bonus,
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
  character: characterSchema,
};

export type Step1Character = z.infer<typeof step1Schema>;
export type Step2Character = z.infer<typeof step2Schema>;
export type Step3Character = z.infer<typeof step3Schema>;
export type Step4Character = z.infer<typeof step4Schema>;
export type CharacterInput = z.input<typeof characterSchema>;
export type Character = z.infer<typeof characterSchema>;

export const defaultCharacter: CharacterInput = {
  name: "New Character",
  class: "Warrior",
  backstory: "A new adventurer begins their journey.",
  strength: 10,
  intelligence: 10,
  agility: 10,
  vitality: 10,
};

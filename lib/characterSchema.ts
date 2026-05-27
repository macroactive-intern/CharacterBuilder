import { z } from "zod";

export const characterSchema = z.object({
  name: z.string().min(1).default("New Character"),
  className: z.string().min(1).default("Adventurer"),
});

export type Character = z.infer<typeof characterSchema>;

export const defaultCharacter: Character = {
  name: "New Character",
  className: "Adventurer",
};

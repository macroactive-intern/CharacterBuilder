import type { Character } from "@/lib/characterSchema";

const storageKey = "character-builder.characters";

export function loadCharacters(): Character[] {
  if (typeof window === "undefined") {
    return [];
  }

  const savedCharacters = window.localStorage.getItem(storageKey);

  return savedCharacters ? (JSON.parse(savedCharacters) as Character[]) : [];
}

export function saveCharacter(character: Character) {
  if (typeof window === "undefined") {
    return;
  }

  const characters = loadCharacters();
  window.localStorage.setItem(storageKey, JSON.stringify([...characters, character]));
}

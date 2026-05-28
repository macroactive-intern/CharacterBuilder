import {
  characterInputSchema,
  defaultCharacter,
  type CharacterInput,
} from "@/lib/characterSchema";

export type CharacterData = CharacterInput;

export interface StoredDraft {
  version: number;
  step: number;
  data: Partial<CharacterData>;
}

export const CURRENT_VERSION = 1;

const draftStorageKey = "character-builder.draft";

type DraftInput = Omit<StoredDraft, "version">;

function getStorage() {
  return typeof window === "undefined" ? null : window.localStorage;
}

function parseDraft(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function isStoredDraft(value: unknown): value is StoredDraft {
  return (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    "step" in value &&
    "data" in value &&
    typeof value.version === "number" &&
    typeof value.step === "number" &&
    typeof value.data === "object" &&
    value.data !== null
  );
}

function hasValidDraftData(draft: StoredDraft) {
  return characterInputSchema.safeParse({
    ...defaultCharacter,
    ...draft.data,
  }).success;
}

export function saveDraft(draft: DraftInput) {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  const storedDraft: StoredDraft = {
    version: CURRENT_VERSION,
    step: draft.step,
    data: draft.data,
  };

  storage.setItem(draftStorageKey, JSON.stringify(storedDraft));

  return storedDraft;
}

export function loadDraft() {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  const savedDraft = storage.getItem(draftStorageKey);

  if (!savedDraft) {
    return null;
  }

  const parsedDraft = parseDraft(savedDraft);

  if (!isStoredDraft(parsedDraft)) {
    storage.removeItem(draftStorageKey);
    return null;
  }

  if (parsedDraft.version !== CURRENT_VERSION) {
    storage.removeItem(draftStorageKey);
    console.warn(
      `Discarded character draft because stored version ${parsedDraft.version} does not match current version ${CURRENT_VERSION}.`,
    );
    return null;
  }

  if (!hasValidDraftData(parsedDraft)) {
    storage.removeItem(draftStorageKey);
    console.warn("Discarded character draft because stored data is invalid.");
    return null;
  }

  return parsedDraft;
}

export function clearDraft() {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.removeItem(draftStorageKey);
}

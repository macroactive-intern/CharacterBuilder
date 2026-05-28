import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import cuid from "cuid";
import { NextResponse } from "next/server";
import { characterSchema, type Character } from "@/lib/characterSchema";
import { createSlug } from "@/lib/characterUtils";
import { skillTree } from "@/lib/skillTree";

export const runtime = "nodejs";

type StoredCharacter = Character & {
  id: string;
  slug: string;
};

const charactersPath = path.join(process.cwd(), "data", "characters.json");
let characterWriteQueue: Promise<void> = Promise.resolve();

function createUniqueSlug(name: string, characters: StoredCharacter[]) {
  const baseSlug = createSlug(name);
  const existingSlugs = new Set(characters.map((character) => character.slug));

  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let suffix = 2;
  let slug = `${baseSlug}-${suffix}`;

  while (existingSlugs.has(slug)) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  return slug;
}

function validateSkills(skillIds: string[]) {
  const selectedSkills = new Set(skillIds);
  const knownSkillIds = new Set(skillTree.map((skill) => skill.id));

  for (const skillId of skillIds) {
    if (!knownSkillIds.has(skillId)) {
      return `Unknown skill: ${skillId}.`;
    }
  }

  for (const skillId of skillIds) {
    const skill = skillTree.find((skillNode) => skillNode.id === skillId);
    const missingPrerequisite = skill?.requires.find(
      (requiredSkillId) => !selectedSkills.has(requiredSkillId),
    );

    if (missingPrerequisite) {
      const requiredSkill = skillTree.find(
        (skillNode) => skillNode.id === missingPrerequisite,
      );
      return `${skill?.name ?? skillId} requires ${
        requiredSkill?.name ?? missingPrerequisite
      }.`;
    }
  }

  return null;
}

async function ensureCharactersFile() {
  await mkdir(path.dirname(charactersPath), { recursive: true });

  try {
    await readFile(charactersPath, "utf-8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await writeFile(charactersPath, "[]", "utf-8");
      return;
    }

    throw error;
  }
}

async function readCharacters() {
  await ensureCharactersFile();

  try {
    const contents = await readFile(charactersPath, "utf-8");
    const parsed = JSON.parse(contents) as unknown;

    return Array.isArray(parsed) ? (parsed as StoredCharacter[]) : [];
  } catch (error) {
    if (error instanceof SyntaxError) {
      return [];
    }

    throw error;
  }
}

async function writeCharacters(characters: StoredCharacter[]) {
  await mkdir(path.dirname(charactersPath), { recursive: true });
  const tempPath = `${charactersPath}.tmp`;

  await writeFile(tempPath, `${JSON.stringify(characters, null, 2)}\n`, "utf-8");
  await rename(tempPath, charactersPath);
}

function withCharacterWriteLock<T>(operation: () => Promise<T>) {
  const run = characterWriteQueue.catch(() => undefined).then(operation);

  characterWriteQueue = run.then(
    () => undefined,
    () => undefined,
  );

  return run;
}

export async function GET() {
  const characters = await readCharacters();

  return NextResponse.json(characters);
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 },
    );
  }

  const parsedCharacter = characterSchema.safeParse(body);

  if (!parsedCharacter.success) {
    return NextResponse.json(
      {
        error: "Character validation failed.",
        issues: parsedCharacter.error.issues.map((issue) => ({
          message: issue.message,
          path: issue.path,
        })),
      },
      { status: 422 },
    );
  }

  const skillError = validateSkills(parsedCharacter.data.skills);

  if (skillError) {
    return NextResponse.json(
      { error: "Skill validation failed.", issues: [{ message: skillError }] },
      { status: 422 },
    );
  }

  try {
    const { id, slug } = await withCharacterWriteLock(async () => {
      const characters = await readCharacters();
      const id = cuid();
      const slug = createUniqueSlug(parsedCharacter.data.name, characters);
      const storedCharacter: StoredCharacter = {
        ...parsedCharacter.data,
        id,
        slug,
      };

      await writeCharacters([...characters, storedCharacter]);

      return { id, slug };
    });

    return NextResponse.json({ id, slug }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to save character." },
      { status: 500 },
    );
  }
}

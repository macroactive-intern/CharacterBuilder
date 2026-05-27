import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { statNames, type Character, type StatName } from "@/lib/characterSchema";
import { getSkillName, statLabels } from "@/lib/characterUtils";
import SkillBadge from "@/components/ui/SkillBadge";

export const dynamic = "force-dynamic";

type StoredCharacter = Character & {
  id: string;
  slug: string;
};

type BuilderSuccessPageProps = {
  searchParams?: {
    id?: string;
  };
};

const charactersPath = path.join(process.cwd(), "data", "characters.json");

async function loadCharacters() {
  try {
    const contents = await readFile(charactersPath, "utf-8");
    const parsed = JSON.parse(contents) as unknown;

    return Array.isArray(parsed) ? (parsed as StoredCharacter[]) : [];
  } catch {
    return [];
  }
}

export default async function BuilderSuccessPage({
  searchParams,
}: BuilderSuccessPageProps) {
  const characterId = searchParams?.id;
  const characters = await loadCharacters();
  const character = characters.find(
    (storedCharacter) => storedCharacter.id === characterId,
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-emerald-700">
            Character created
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            {character ? `${character.name} is ready.` : "Character saved."}
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            {character
              ? `Character ID: ${character.id}`
              : "We could not find a saved character for this URL."}
          </p>

          {character ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <section className="rounded-md border border-slate-200 p-4">
                <h2 className="text-sm font-semibold uppercase text-slate-500">
                  Identity
                </h2>
                <dl className="mt-3 space-y-3 text-sm">
                  <div>
                    <dt className="text-slate-500">Class</dt>
                    <dd className="font-medium text-slate-950">
                      {character.class}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Slug</dt>
                    <dd className="font-medium text-slate-950">
                      {character.slug}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Backstory</dt>
                    <dd className="leading-6 text-slate-800">
                      {character.backstory}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-md border border-slate-200 p-4">
                <h2 className="text-sm font-semibold uppercase text-slate-500">
                  Final stats
                </h2>
                <dl className="mt-3 grid grid-cols-2 gap-3">
                  {statNames.map((statName) => (
                    <div
                      className="rounded-md border border-slate-200 bg-slate-50 p-3"
                      key={statName}
                    >
                      <dt className="text-xs text-slate-500">
                        {statLabels[statName]}
                      </dt>
                      <dd className="mt-1 text-xl font-bold text-slate-950">
                        {character[statName]}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section className="rounded-md border border-slate-200 p-4">
                <h2 className="text-sm font-semibold uppercase text-slate-500">
                  Skills
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {character.skills.length > 0 ? (
                    character.skills.map((skillId) => (
                      <SkillBadge key={skillId} name={getSkillName(skillId)} />
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      No skills selected.
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-md border border-slate-200 p-4">
                <h2 className="text-sm font-semibold uppercase text-slate-500">
                  Appearance
                </h2>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-slate-500">Hair</dt>
                    <dd className="font-medium text-slate-950">
                      {character.hairColor}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Eyes</dt>
                    <dd className="font-medium text-slate-950">
                      {character.eyeColor}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Height</dt>
                    <dd className="font-medium text-slate-950">
                      {character.height}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Motto</dt>
                    <dd className="font-medium text-slate-950">
                      {character.motto || "No motto"}
                    </dd>
                  </div>
                </dl>
              </section>
            </div>
          ) : null}

          <Link
            className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            href="/builder"
          >
            Build another character
          </Link>
        </div>
      </div>
    </main>
  );
}

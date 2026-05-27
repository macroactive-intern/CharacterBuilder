import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">Character Builder</h1>
      <Link className="mt-4 inline-block underline" href="/builder">
        Start building
      </Link>
    </main>
  );
}

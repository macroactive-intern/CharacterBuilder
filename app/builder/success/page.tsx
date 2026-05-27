import Link from "next/link";

export default function BuilderSuccessPage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">Character saved</h1>
      <Link className="mt-4 inline-block underline" href="/builder">
        Build another character
      </Link>
    </main>
  );
}

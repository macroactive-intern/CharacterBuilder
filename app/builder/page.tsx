import BuilderProgress from "@/components/builder/BuilderProgress";
import CharacterPreview from "@/components/builder/CharacterPreview";
import Step1Class from "@/components/builder/Step1Class";

export default function BuilderPage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">Character Builder</h1>
      <BuilderProgress currentStep={1} />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Step1Class />
        <CharacterPreview />
      </div>
    </main>
  );
}

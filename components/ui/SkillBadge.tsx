type SkillBadgeProps = {
  name: string;
  /** Use "dark" inside dark-background sections like CharacterPreview */
  variant?: "light" | "dark";
};

export default function SkillBadge({ name, variant = "light" }: SkillBadgeProps) {
  return (
    <span
      className={
        variant === "dark"
          ? "rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-medium text-emerald-100"
          : "rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800"
      }
    >
      {name}
    </span>
  );
}

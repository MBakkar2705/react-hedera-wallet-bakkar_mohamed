import type { ReactNode } from "react";

type Tone = "info" | "success" | "danger";

const tones: Record<Tone, string> = {
  info: "border-brand bg-surface-muted",
  success: "border-success bg-success-wash",
  danger: "border-danger bg-danger-wash",
};

// A block for a result (success), a figure (info) or an error (danger).
export function Callout({
  tone = "info",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <div
      role={tone === "danger" ? "alert" : undefined}
      className={`flex flex-col gap-2 rounded-xl border-l-4 px-4 py-3 ${tones[tone]}`}
    >
      {children}
    </div>
  );
}

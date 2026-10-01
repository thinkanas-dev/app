import type { ReactNode } from "react";

type Variant = "cream" | "warm";

const variantClasses: Record<Variant, string> = {
  cream: "bg-surface-secondary border border-surface-warm",
  warm: "bg-surface-warm",
};

export function Card({
  variant = "cream",
  children,
}: {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <div className={`rounded-md p-8 text-ink ${variantClasses[variant]}`}>
      {children}
    </div>
  );
}

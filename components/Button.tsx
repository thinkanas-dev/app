import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "tertiary";

const variantClasses: Record<Variant, string> = {
  primary: "bg-ink text-canvas hover:opacity-90",
  secondary: "bg-canvas text-ink border border-ink hover:bg-surface-secondary",
  tertiary: "bg-transparent text-ink border border-text-secondary hover:bg-surface-secondary",
};

const base =
  "inline-flex items-center justify-center h-11 px-6 rounded-md font-serif font-semibold text-lg transition-opacity";

export function Button({
  href,
  variant = "primary",
  children,
  type,
}: {
  href?: string;
  variant?: Variant;
  children: ReactNode;
  type?: "submit" | "button";
}) {
  const className = `${base} ${variantClasses[variant]}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type ?? "button"} className={className}>
      {children}
    </button>
  );
}

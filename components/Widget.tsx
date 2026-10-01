import type { ReactNode } from "react";

export function Widget({
  delay = 0,
  className = "",
  children,
}: {
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`animate-fade-in-up bg-canvas rounded-lg border border-hairline px-5 py-5 ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

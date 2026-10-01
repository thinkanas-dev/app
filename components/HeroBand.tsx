import type { ReactNode } from "react";

type Variant = "cream" | "black";

const variantClasses: Record<Variant, string> = {
  cream: "bg-canvas text-ink",
  black: "bg-inverse text-canvas",
};

export function HeroBand({
  variant = "cream",
  contained = true,
  children,
}: {
  variant?: Variant;
  contained?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={`w-full py-24 px-8 ${variantClasses[variant]}`}>
      {contained ? <div className="mx-auto max-w-[720px]">{children}</div> : children}
    </section>
  );
}

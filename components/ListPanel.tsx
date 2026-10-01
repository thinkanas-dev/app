import type { ReactNode } from "react";

export function ListPanel({ children }: { children: ReactNode }) {
  return (
    <div className="bg-canvas rounded-lg border border-hairline divide-y divide-hairline overflow-hidden [&>*]:px-5 [&>*]:py-4">
      {children}
    </div>
  );
}

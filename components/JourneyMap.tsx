import { journeyNodes } from "@/content/journey";
import { JourneyNode } from "./JourneyNode";

export function JourneyMap() {
  return (
    <div className="bg-surface-secondary rounded-md border border-hairline px-6 py-8">
      <p className="font-mono uppercase text-xs text-text-tertiary mb-6">Le parcours</p>
      <div className="flex flex-wrap items-start gap-x-1 gap-y-6">
        {journeyNodes.map((node, i) => (
          <div key={node.id} className="flex items-start">
            <JourneyNode node={node} />
            {i < journeyNodes.length - 1 && (
              <div
                aria-hidden
                className="w-6 md:w-10 h-16 flex items-center shrink-0"
                style={{ marginTop: 0 }}
              >
                <div className="w-full border-t border-dashed border-text-secondary" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

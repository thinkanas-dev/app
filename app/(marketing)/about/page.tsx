import { HeroBand } from "@/components/HeroBand";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { Divider } from "@/components/Divider";
import { aboutContent } from "@/content/about";

export default function AboutPage() {
  return (
    <HeroBand variant="cream">
      <SectionEyebrow>{aboutContent.eyebrow}</SectionEyebrow>
      <h1 className="font-serif text-ink text-6xl leading-tight mb-8">
        {aboutContent.heading}
      </h1>
      <p className="font-serif text-2xl text-ink leading-relaxed mb-12">
        {aboutContent.intro}
      </p>

      <div className="flex flex-col gap-10">
        {aboutContent.sections.map((section, i) => (
          <div key={section.heading}>
            {i > 0 && <Divider />}
            <h2 className="font-sans font-semibold text-2xl text-ink mt-10 mb-4">
              {section.heading}
            </h2>
            <p className="font-serif text-lg text-ink leading-relaxed">{section.body}</p>
          </div>
        ))}
      </div>
    </HeroBand>
  );
}

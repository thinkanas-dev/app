import { HeroBand } from "@/components/HeroBand";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { homeContent } from "@/content/home";

export default function HomePage() {
  const { hero, sectionOne, sectionTwo, cta } = homeContent;

  return (
    <>
      <HeroBand variant="black">
        <SectionEyebrow>{hero.eyebrow}</SectionEyebrow>
        <h1 className="font-sans font-bold text-canvas text-6xl leading-[1.05] tracking-tight mb-6">
          {hero.heading}
        </h1>
        <p className="font-serif text-2xl text-text-secondary leading-snug mb-8">
          {hero.body}
        </p>
        <Button href={hero.ctaHref} variant="secondary">
          {hero.ctaLabel}
        </Button>
      </HeroBand>

      <HeroBand variant="cream">
        <SectionEyebrow>{sectionOne.eyebrow}</SectionEyebrow>
        <h2 className="font-serif text-ink text-5xl leading-tight mb-6">
          {sectionOne.heading}
        </h2>
        <p className="font-serif text-2xl text-ink leading-relaxed">
          {sectionOne.body}
        </p>
      </HeroBand>

      <HeroBand variant="black" contained={false}>
        <div className="mx-auto max-w-[960px] px-8">
          <SectionEyebrow>{sectionTwo.eyebrow}</SectionEyebrow>
          <h2 className="font-serif text-canvas text-5xl leading-tight mb-12">
            {sectionTwo.heading}
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {sectionTwo.items.map((item) => (
              <Card key={item.title} variant="cream">
                <h3 className="font-sans font-semibold text-xl mb-3">{item.title}</h3>
                <p className="font-serif text-lg text-text-muted leading-relaxed">
                  {item.body}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </HeroBand>

      <HeroBand variant="cream">
        <h2 className="font-serif text-ink text-5xl leading-tight mb-6">
          {cta.heading}
        </h2>
        <p className="font-serif text-2xl text-ink leading-relaxed mb-8">
          {cta.body}
        </p>
        <div className="flex gap-4">
          <Button href={cta.primaryHref} variant="primary">
            {cta.primaryLabel}
          </Button>
          <Button href={cta.secondaryHref} variant="tertiary">
            {cta.secondaryLabel}
          </Button>
        </div>
      </HeroBand>
    </>
  );
}

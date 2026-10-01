import { HeroBand } from "@/components/HeroBand";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { Card } from "@/components/Card";
import { blogContent, type AccentColor } from "@/content/blog";

const accentClasses: Record<AccentColor, string> = {
  clay: "bg-accent-clay text-canvas",
  fig: "bg-accent-fig text-canvas",
  cactus: "bg-accent-cactus text-ink",
  sky: "bg-accent-sky text-canvas",
};

export default function BlogPage() {
  return (
    <HeroBand variant="cream" contained={false}>
      <div className="mx-auto max-w-[960px] px-8">
        <SectionEyebrow>{blogContent.eyebrow}</SectionEyebrow>
        <h1 className="font-serif text-ink text-6xl leading-tight mb-6">
          {blogContent.heading}
        </h1>
        <p className="font-serif text-2xl text-ink leading-relaxed mb-12 max-w-[720px]">
          {blogContent.intro}
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          {blogContent.posts.map((post) => (
            <Card key={post.slug} variant="cream">
              <span
                className={`inline-block font-mono uppercase text-xs px-3 py-1 rounded-sm mb-4 ${accentClasses[post.accent]}`}
              >
                {post.category}
              </span>
              <h2 className="font-sans font-semibold text-xl mb-3">{post.title}</h2>
              <p className="font-serif text-lg text-text-muted leading-relaxed mb-4">
                {post.excerpt}
              </p>
              <p className="font-mono uppercase text-xs text-text-tertiary">{post.date}</p>
            </Card>
          ))}
        </div>
      </div>
    </HeroBand>
  );
}

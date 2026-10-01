"use client";

import { HeroBand } from "@/components/HeroBand";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { TextInput, TextArea } from "@/components/TextInput";
import { Button } from "@/components/Button";
import { contactContent } from "@/content/contact";

export default function ContactPage() {
  const { form } = contactContent;

  return (
    <HeroBand variant="cream">
      <SectionEyebrow>{contactContent.eyebrow}</SectionEyebrow>
      <h1 className="font-serif text-ink text-6xl leading-tight mb-6">
        {contactContent.heading}
      </h1>
      <p className="font-serif text-2xl text-ink leading-relaxed mb-12">
        {contactContent.intro}
      </p>

      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="font-sans text-sm font-medium text-ink">
            {form.nameLabel}
          </label>
          <TextInput id="name" name="name" required />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="font-sans text-sm font-medium text-ink">
            {form.emailLabel}
          </label>
          <TextInput id="email" name="email" type="email" required />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="message" className="font-sans text-sm font-medium text-ink">
            {form.messageLabel}
          </label>
          <TextArea id="message" name="message" required />
        </div>

        <div>
          <Button type="submit" variant="primary">
            {form.submitLabel}
          </Button>
        </div>
      </form>
    </HeroBand>
  );
}

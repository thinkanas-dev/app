import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const fieldClasses =
  "w-full bg-canvas text-ink font-serif text-lg rounded-sm border border-text-secondary px-4 py-3 outline-none focus:border-ink transition-colors";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={fieldClasses} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${fieldClasses} min-h-36 resize-y`} />;
}

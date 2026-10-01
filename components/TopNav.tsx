import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { SelecteurTheme } from "./SelecteurTheme";

const links = [
  { href: "/objectifs", label: "Objectifs" },
  { href: "/about", label: "À propos" },
  { href: "/blog", label: "Recherche" },
  { href: "/contact", label: "Contact" },
];

export function TopNav() {
  return (
    <header className="w-full h-[72px] bg-canvas flex items-center justify-between gap-4 px-8">
      <div className="shrink-0">
        <Wordmark />
      </div>
      <nav className="flex items-center gap-1 shrink-0">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="font-serif text-xl text-ink px-3 py-2 whitespace-nowrap hover:text-text-muted transition-colors"
          >
            {link.label}
          </Link>
        ))}
        <span className="ml-2">
          <SelecteurTheme />
        </span>
      </nav>
    </header>
  );
}

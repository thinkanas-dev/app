import Image from "next/image";
import Link from "next/link";

export function Wordmark() {
  return (
    <Link href="/" className="flex items-center" aria-label="think.anas — accueil">
      <Image
        src="/logo.png"
        alt="think.anas"
        width={2172}
        height={724}
        priority
        className="logo-adaptatif h-8 w-auto"
      />
    </Link>
  );
}

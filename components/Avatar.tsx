/* eslint-disable @next/next/no-img-element */

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function Avatar({
  photo,
  name,
  size = 36,
  className = "",
}: {
  photo?: string;
  name: string;
  size?: number;
  className?: string;
}) {
  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={`rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <span
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.36) }}
      className={`rounded-full bg-brand-soft text-brand font-sans font-semibold flex items-center justify-center shrink-0 ${className}`}
    >
      {initialsOf(name)}
    </span>
  );
}

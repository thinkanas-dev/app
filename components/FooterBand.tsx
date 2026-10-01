export function FooterBand() {
  return (
    <footer className="w-full bg-inverse text-canvas py-24 px-8">
      <div className="mx-auto max-w-[720px] flex flex-col gap-4">
        <p className="font-sans font-bold text-2xl">think.anas</p>
        <p className="font-serif text-lg text-text-secondary">
          © {new Date().getFullYear()} think.anas. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}

// The mark of the application: a wallet drawn with simple shapes.
// It takes the color of the text around it (currentColor).
export function WalletGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <path
        d="M9 12.5A2.5 2.5 0 0 1 11.5 10H21"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="8" y="12.5" width="16" height="11" rx="3" fill="currentColor" />
      <circle cx="20.5" cy="18" r="1.7" className="fill-brand" />
    </svg>
  );
}

export function BrandMark() {
  return (
    <span className="grid size-8 place-items-center rounded-lg bg-brand text-white">
      <WalletGlyph className="size-6" />
    </span>
  );
}

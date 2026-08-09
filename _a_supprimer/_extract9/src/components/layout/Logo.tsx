export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-label="Stone Car Prestige">
      <path d="M6 34l4-20 8 10 6-14 6 14 8-10 4 20z" fill="url(#scp-gold)" />
      <rect x="6" y="34" width="36" height="6" rx="1.5" fill="url(#scp-gold)" />
      <defs>
        <linearGradient id="scp-gold" x1="0" y1="0" x2="48" y2="48">
          <stop stopColor="#E9CE7B" />
          <stop offset="1" stopColor="#9C7B1E" />
        </linearGradient>
      </defs>
    </svg>
  );
}

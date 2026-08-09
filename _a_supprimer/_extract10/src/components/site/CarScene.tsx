/**
 * Illustration vectorielle d'un véhicule, deux états :
 * "avant" (terne, poussiéreux) et "apres" (noir brillant, jantes or, reflets).
 * Placeholder premium — à remplacer par de vraies photos quand disponibles.
 */
const SPOKES = [0, 72, 144, 216, 288].map((a) => ({
  dx: 15 * Math.cos((a * Math.PI) / 180),
  dy: 15 * Math.sin((a * Math.PI) / 180),
}));

export function CarScene({ variant }: { variant: "avant" | "apres" }) {
  const apres = variant === "apres";
  const u = variant;

  return (
    <svg
      viewBox="0 0 420 210"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`body-${u}`} x1="0" y1="0" x2="0" y2="1">
          {apres ? (
            <>
              <stop offset="0" stopColor="#33333a" />
              <stop offset="0.45" stopColor="#17171b" />
              <stop offset="1" stopColor="#08080a" />
            </>
          ) : (
            <>
              <stop offset="0" stopColor="#6f6d6a" />
              <stop offset="1" stopColor="#3f3e3c" />
            </>
          )}
        </linearGradient>
        <linearGradient id={`glass-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a3340" />
          <stop offset="1" stopColor="#0e1116" />
        </linearGradient>
        <linearGradient id={`gold-${u}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E9CE7B" />
          <stop offset="1" stopColor="#9C7B1E" />
        </linearGradient>
        <radialGradient id={`glow-${u}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#C9A227" stopOpacity="0.5" />
          <stop offset="1" stopColor="#C9A227" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`scene-${u}`} cx="0.7" cy="0.1" r="1">
          <stop offset="0" stopColor="#20200f" />
          <stop offset="0.6" stopColor="#0c0c0e" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="420" height="210" fill={apres ? `url(#scene-${u})` : "#141414"} />
      {apres ? (
        <ellipse cx="210" cy="182" rx="185" ry="16" fill={`url(#glow-${u})`} />
      ) : (
        <ellipse cx="210" cy="180" rx="150" ry="9" fill="#000" opacity="0.45" />
      )}

      <g style={apres ? undefined : { filter: "grayscale(.45) brightness(.95)" }}>
        <circle cx="118" cy="150" r="35" fill="#000" />
        <circle cx="316" cy="150" r="35" fill="#000" />

        <path
          d="M34 150 L34 138 Q34 126 58 122 L82 120 Q96 94 134 88 Q152 58 200 55 L250 55 Q298 58 326 94 L356 106 Q386 115 388 138 L388 150 Z"
          fill={`url(#body-${u})`}
          stroke="#000"
          strokeOpacity="0.3"
        />
        <path
          d="M140 88 Q156 60 200 58 L248 58 Q290 61 316 92 L300 92 Q280 74 250 72 L200 72 Q168 74 156 92 Z"
          fill={`url(#glass-${u})`}
        />
        <line x1="226" y1="70" x2="230" y2="92" stroke="#05070a" strokeWidth="3" />
        <path d="M120 104 L322 104" stroke="#000" strokeOpacity="0.35" strokeWidth="1.5" />
        <rect x="196" y="100" width="18" height="4" rx="2" fill="#000" opacity="0.4" />
        <path d="M36 132 q-4 4 0 12 l10 -2 q2 -6 -1 -12 z" fill={apres ? "#f4f2ec" : "#cfcdc9"} opacity="0.85" />
        <rect x="372" y="126" width="14" height="10" rx="3" fill="#7a1f1f" />

        {apres ? (
          <>
            <path d="M92 118 L150 66 L162 66 L104 118 Z" fill="#fff" opacity="0.10" />
            <path d="M170 62 L250 60 L250 66 L172 68 Z" fill="#fff" opacity="0.12" />
            <path d="M60 128 Q210 116 388 130" stroke="#E9CE7B" strokeWidth="1.5" fill="none" opacity="0.5" />
          </>
        ) : (
          <>
            <g fill="#9a8f76" opacity="0.5">
              <circle cx="120" cy="120" r="2.2" />
              <circle cx="160" cy="128" r="1.6" />
              <circle cx="200" cy="118" r="2" />
              <circle cx="240" cy="126" r="1.8" />
              <circle cx="280" cy="120" r="2.3" />
              <circle cx="150" cy="112" r="1.5" />
              <circle cx="300" cy="128" r="1.7" />
              <circle cx="100" cy="126" r="1.9" />
              <circle cx="330" cy="120" r="1.6" />
              <circle cx="215" cy="132" r="1.5" />
              <circle cx="185" cy="124" r="1.4" />
              <circle cx="260" cy="132" r="1.6" />
            </g>
            <path d="M70 134 Q210 126 380 136" stroke="#b9b1a0" strokeWidth="2" fill="none" opacity="0.25" />
          </>
        )}

        {[118, 316].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="150" r="32" fill="#111" />
            <circle cx={cx} cy="150" r="31" fill="none" stroke="#000" strokeWidth="2" />
            <circle cx={cx} cy="150" r="17" fill={apres ? `url(#gold-${u})` : "#5c5b58"} />
            <circle cx={cx} cy="150" r="5" fill="#0c0c0e" />
            {apres && (
              <g stroke="#0c0c0e" strokeWidth="2">
                {SPOKES.map((s, i) => (
                  <line key={i} x1={cx} y1="150" x2={cx + s.dx} y2={150 + s.dy} />
                ))}
              </g>
            )}
          </g>
        ))}
      </g>
    </svg>
  );
}

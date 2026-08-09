/** Silhouette de véhicule stylisée (placeholder photo, cohérent DA). */
export function CarSilhouette({
  className,
  width = 60,
}: {
  className?: string;
  width?: number;
}) {
  return (
    <svg
      viewBox="0 0 60 34"
      width={width}
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 24c0-1.5 1.5-2 3-2l4-6c1.5-2 3.5-3 6-3h16c3 0 5 1.5 7 3.5l8 2c4 1 7 2 7 4v2c0 1.5-1.5 2-3 2H8c-2.5 0-4-1.5-4-4z"
        fill="#3a3a42"
      />
      <circle cx="19" cy="26" r="4.5" fill="#111" />
      <circle cx="19" cy="26" r="1.8" fill="#C9A227" />
      <circle cx="45" cy="26" r="4.5" fill="#111" />
      <circle cx="45" cy="26" r="1.8" fill="#C9A227" />
    </svg>
  );
}

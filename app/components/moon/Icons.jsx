// MOON — small inline icon set used across the landing page sections.
export function Arrow({size = 14}) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M3 11L11 3M11 3H4.5M11 3V9.5" />
    </svg>
  );
}

export function Heart({size = 16}) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M8 13.5s-5-3-5-7a2.7 2.7 0 0 1 5-1.5A2.7 2.7 0 0 1 13 6.5c0 4-5 7-5 7z" />
    </svg>
  );
}

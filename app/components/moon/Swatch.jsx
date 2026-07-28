// MOON — decorative textured placeholder for editorial sections that aren't
// backed by Storefront API data yet (e.g. journal posts). Real product and
// collection imagery uses Hydrogen's <Image> component instead — see
// ProductCard / Categories in app/routes/_index.jsx.
const TONES = {
  warm: 'repeating-linear-gradient(135deg, rgba(168,152,129,.18) 0 12px, transparent 12px 24px), linear-gradient(180deg,#e8e0d2,#d8cdba)',
  dark: 'repeating-linear-gradient(135deg, rgba(255,255,255,.06) 0 12px, transparent 12px 24px), linear-gradient(180deg,#2a2622,#1a1714)',
  sage: 'repeating-linear-gradient(135deg, rgba(120,140,110,.18) 0 12px, transparent 12px 24px), linear-gradient(180deg,#dde2d4,#c7ceba)',
  clay: 'repeating-linear-gradient(135deg, rgba(194,128,106,.18) 0 12px, transparent 12px 24px), linear-gradient(180deg,#e9d7cc,#d6bdaf)',
  slate: 'repeating-linear-gradient(135deg, rgba(110,120,130,.18) 0 12px, transparent 12px 24px), linear-gradient(180deg,#d6dade,#bdc3c9)',
  neutral: 'repeating-linear-gradient(135deg, rgba(120,120,120,.14) 0 12px, transparent 12px 24px), linear-gradient(180deg,#e8e6e3,#d4d1cc)',
};

export function Swatch({label, tone = 'warm', aspect, style}) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: aspect,
        background: TONES[tone] || TONES.neutral,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'flex-end',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--mono)',
          fontSize: 10,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: 'rgba(28,26,23,.55)',
          textAlign: 'center',
          padding: 20,
          lineHeight: 1.5,
        }}
      >
        <span>[ {label} ]</span>
      </div>
    </div>
  );
}

/**
 * Original marks for the placeholder partner brands. Each is a simple white glyph on a coloured
 * tile, deliberately unlike any real bank's or insurer's logo (no keyholes, stars, "i" swooshes,
 * heartbeat boxes, seals or red crosses).
 */
export type BrandId = "zbi" | "ibibi" | "oxis" | "ztar" | "mivapupa" | "fbi";

export const BRAND_COLOR: Record<BrandId, string> = {
  zbi: "#0f766e",
  ibibi: "#6d28d9",
  oxis: "#15803d",
  ztar: "#ea580c",
  mivapupa: "#db2777",
  fbi: "#0e7490",
};

const W = { fill: "none", stroke: "#fff", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function Glyph({ id, color }: { id: BrandId; color: string }) {
  switch (id) {
    case "zbi": // a single-stroke Z
      return <path d="M9.5 10.5h13L9.5 21.5h13" {...W} strokeWidth={3.2} />;
    case "ibibi": // two linked rounded squares
      return (
        <>
          <rect x="7.5" y="7.5" width="11" height="11" rx="3" {...W} strokeWidth={2.6} />
          <rect x="13.5" y="13.5" width="11" height="11" rx="3" {...W} strokeWidth={2.6} />
        </>
      );
    case "oxis": // ring with one filled quarter
      return (
        <>
          <circle cx="16" cy="16" r="7.5" {...W} strokeWidth={3} />
          <path d="M16 16V8.5A7.5 7.5 0 0 1 23.5 16Z" fill="#fff" />
        </>
      );
    case "ztar": // shield carrying a leaf
      return (
        <>
          <path d="M16 6.5l7.5 3v5.8c0 4.8-3.2 8.4-7.5 10-4.3-1.6-7.5-5.2-7.5-10V9.5z" fill="#fff" />
          <path d="M12.6 19.2c0-4 2.8-6.8 6.8-6.8 0 4-2.8 6.8-6.8 6.8Zm0 0 3.6-3.6" fill={color} stroke={color} strokeWidth={1.2} strokeLinecap="round" />
        </>
      );
    case "mivapupa": // two overlapping rings
      return (
        <>
          <circle cx="13" cy="16" r="6" {...W} strokeWidth={2.6} />
          <circle cx="19" cy="16" r="6" {...W} strokeWidth={2.6} />
        </>
      );
    case "fbi": // outlined heart
      return <path d="M16 23.2s-7.2-4.4-7.2-9.4a3.9 3.9 0 0 1 7.2-2.1 3.9 3.9 0 0 1 7.2 2.1c0 5-7.2 9.4-7.2 9.4Z" {...W} strokeWidth={2.6} />;
  }
}

export function BrandMark({ id, size = 28, title }: { id: BrandId; size?: number; title?: string }) {
  const color = BRAND_COLOR[id];
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} className="shrink-0">
      <rect width="32" height="32" rx="8" fill={color} />
      <Glyph id={id} color={color} />
    </svg>
  );
}

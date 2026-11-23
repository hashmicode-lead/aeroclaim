import { useId } from "react";

/**
 * AeroClaim mark: a plane climbing inside an open orbit ring.
 * Shown without a background in the UI; pass `tile` for an app-icon style white tile
 * (the favicon in src/app/icon.svg keeps the tile so it reads on dark browser tabs).
 * Reference artwork: public/brand/aeroclaim-logo.jpg
 */
export function LogoMark({ size = 24, className = "", tile = false }: { size?: number; className?: string; tile?: boolean }) {
  const uid = useId().replace(/:/g, "");
  const tileId = `${uid}t`;
  const blue = `${uid}b`;
  // Without the tile, crop the viewBox to the ring so the mark fills its box and aligns with text.
  const viewBox = tile ? "0 0 32 32" : "4.6 4.6 22.8 22.8";
  return (
    <svg width={size} height={size} viewBox={viewBox} className={className} aria-hidden>
      <defs>
        <linearGradient id={tileId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#eef1f6" />
        </linearGradient>
        <linearGradient id={blue} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#36b4ff" />
          <stop offset="1" stopColor="#0a6cff" />
        </linearGradient>
      </defs>
      {tile && (
        <path
          fill={`url(#${tileId})`}
          stroke="rgba(0,0,0,0.09)"
          strokeWidth="0.6"
          d="M16 .3c9.5 0 12.6 0 14.2 1.5s1.5 4.7 1.5 14.2 0 12.6-1.5 14.2-4.7 1.5-14.2 1.5S3.4 31.7 1.8 30.2.3 25.5.3 16 .3 3.4 1.8 1.8 6.5.3 16 .3Z"
        />
      )}
      {/* Open ring: ~84% of the circle, gap at the upper right */}
      <circle cx="16" cy="16" r="10.2" fill="none" stroke={`url(#${blue})`} strokeWidth="2.1" strokeLinecap="round" strokeDasharray="54 64.1" transform="rotate(-12 16 16)" />
      {/* Plane (Material "flight" glyph, Apache-2.0), heading up-right */}
      <g transform="translate(16 16) rotate(45) scale(0.62) translate(-12 -12)">
        <path fill={`url(#${blue})`} d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
      </g>
    </svg>
  );
}

export function Logo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <LogoMark size={size} />
      <span className="text-[18px] leading-none font-bold tracking-[-0.035em]">
        <span className="text-ink">Aero</span>
        <span className="bg-gradient-to-b from-[#1f97ff] to-[#0a6cff] bg-clip-text text-transparent">Claim</span>
      </span>
    </span>
  );
}

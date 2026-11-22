import { useId } from "react";

/**
 * AeroClaim mark: a boarding pass, tilted as if handed over, carrying a check.
 * Ticket in, claim approved out. Continuous-corner tile in the brand blue.
 */
export function LogoMark({ size = 22, className = "" }: { size?: number; className?: string }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${uid}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f8bff" />
          <stop offset="1" stopColor="#0058b8" />
        </linearGradient>
        <mask id={`${uid}m`}>
          <rect width="32" height="32" fill="#fff" />
          <circle cx="6.6" cy="16" r="2.3" fill="#000" />
          <circle cx="25.4" cy="16" r="2.3" fill="#000" />
        </mask>
      </defs>
      <path fill={`url(#${uid}g)`} d="M16 0c9.6 0 12.8 0 14.4 1.6S32 6.4 32 16s0 12.8-1.6 14.4S25.6 32 16 32 3.2 32 1.6 30.4 0 25.6 0 16 0 3.2 1.6 1.6 6.4 0 16 0Z" />
      <g transform="rotate(-12 16 16)">
        <rect x="6.6" y="9.6" width="18.8" height="12.8" rx="2.6" fill="#fff" mask={`url(#${uid}m)`} />
        <path d="M12 16.3l2.7 2.7 5.4-5.6" fill="none" stroke="#0066cc" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function Logo({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      <span className="text-[16px] font-semibold tracking-[-0.03em] text-ink">AeroClaim</span>
    </span>
  );
}

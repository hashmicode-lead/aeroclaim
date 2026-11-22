"use client";

import { useEffect, useRef, useState } from "react";

/** Pointer-driven signature pad: tracks 1:1 with pointer capture, smooths with quadratic curves. */
export function SignaturePad({ onChange }: { onChange: (signed: boolean) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const mid = useRef<{ x: number; y: number } | null>(null);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    const c = canvas.current!;
    const resize = () => {
      const r = c.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      c.width = r.width * dpr;
      c.height = r.height * dpr;
      const ctx = c.getContext("2d")!;
      ctx.scale(dpr, dpr);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 2.25;
      ctx.strokeStyle = "#1d1d1f";
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const point = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  return (
    <div>
      <div className="relative">
        <canvas
          ref={canvas}
          aria-label="Signature pad: draw your signature"
          className="h-36 w-full cursor-crosshair touch-none rounded-2xl bg-surface ring-1 ring-line"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            last.current = mid.current = point(e);
          }}
          onPointerMove={(e) => {
            if (!last.current) return;
            const ctx = canvas.current!.getContext("2d")!;
            const p = point(e);
            const m = { x: (last.current.x + p.x) / 2, y: (last.current.y + p.y) / 2 };
            ctx.beginPath();
            ctx.moveTo(mid.current!.x, mid.current!.y);
            ctx.quadraticCurveTo(last.current.x, last.current.y, m.x, m.y);
            ctx.stroke();
            last.current = p;
            mid.current = m;
            if (!signed) {
              setSigned(true);
              onChange(true);
            }
          }}
          onPointerUp={() => (last.current = null)}
          onPointerCancel={() => (last.current = null)}
        />
        {!signed && <span className="caption pointer-events-none absolute inset-0 flex items-center justify-center text-muted">Sign here with your mouse or finger</span>}
        <div className="pointer-events-none absolute right-6 bottom-8 left-6 h-px bg-line" aria-hidden />
      </div>
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          className="footnote text-accent hover:underline disabled:opacity-40"
          disabled={!signed}
          onClick={() => {
            const c = canvas.current!;
            c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
            setSigned(false);
            onChange(false);
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

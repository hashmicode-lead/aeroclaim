"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ProtectionPlans } from "./ProtectionPlans";

/** Travel protection plans as a sheet: dims the page, closes on Esc, the scrim or the close button. */
export function ProtectionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [closing, setClosing] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  const close = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, reduce ? 0 : 180);
  };

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="presentation">
      <div className={`scrim absolute inset-0 bg-black/35 ${closing ? "scrim-out" : ""}`} onClick={close} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="protection-title"
        tabIndex={-1}
        className={`sheet relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl bg-bg p-5 shadow-[var(--shadow-raised)] outline-none sm:rounded-3xl sm:p-8 ${closing ? "sheet-out" : ""}`}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-line sm:hidden" aria-hidden />
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="protection-title" className="title-1">Travel Protection &amp; Insurance Plans</h2>
            <p className="footnote mt-1 text-muted">Single trip, annual or for your whole team.</p>
          </div>
          <button onClick={close} aria-label="Close" className="pressable flex size-8 shrink-0 items-center justify-center rounded-full bg-fill text-muted hover:text-ink">
            <X size={16} aria-hidden />
          </button>
        </div>
        <ProtectionPlans compact />
        <div className="mt-6 text-center">
          <Link href="/protection" onClick={close} className="footnote text-accent hover:underline">Open the full protection page ›</Link>
        </div>
      </div>
    </div>
  );
}

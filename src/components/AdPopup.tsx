"use client";

import { ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";

const KEY = "aeroclaim.adpopup.seen";

/** Sponsored pop-up shown once per browser session, a few seconds after landing. Placeholder insurer. */
export function AdPopup({ delay = 3500 }: { delay?: number }) {
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {}
    if (seen) return;
    const t = setTimeout(() => {
      setShow(true);
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {}
    }, delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!show) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  });

  function close() {
    setLeaving(true);
    setTimeout(() => setShow(false), 180);
  }

  if (!show) return null;

  return (
    <aside
      role="dialog"
      aria-label="Sponsored offer from Ztar Health Insurance"
      className={`fixed right-4 bottom-4 left-4 z-50 overflow-hidden rounded-3xl bg-surface shadow-[var(--shadow-raised)] ring-1 ring-line sm:left-auto sm:w-[360px] ${leaving ? "sheet-out" : "sheet"}`}
    >
      <div className="relative bg-accent px-6 pt-6 pb-5 text-white">
        <div className="absolute -right-8 -bottom-12 size-36 rounded-full bg-white/10" aria-hidden />
        <div className="absolute right-10 -top-10 size-20 rounded-full bg-white/10" aria-hidden />
        <span className="caption relative rounded-full bg-white/20 px-2 py-0.5 font-medium">Sponsored · Ztar Health Insurance</span>
        <p className="title-2 relative mt-3">Flying this month? Get paid if you&apos;re delayed.</p>
      </div>
      <button aria-label="Close ad" onClick={close} className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-black/25 text-white hover:bg-black/40">
        <X size={11} strokeWidth={2.5} aria-hidden />
      </button>
      <div className="p-6 pt-5">
        <ul className="footnote space-y-1.5">
          {["₹2,500 paid automatically for delays over 4 hours", "Baggage cover up to ₹50,000", "From ₹149 per trip, bought in 60 seconds"].map((x) => (
            <li key={x} className="flex gap-2"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-ok" aria-hidden />{x}</li>
          ))}
        </ul>
        <button className="btn-primary mt-5 w-full py-2.5!" onClick={() => setDone(true)} disabled={done}>
          {done ? "We've emailed you a quote" : "Get my quote"}
        </button>
        <p className="caption mt-2 text-center text-muted">Insurance is offered by the partner, not AeroClaim.</p>
      </div>
    </aside>
  );
}

"use client";

import { Check, FileText, Loader2, Plane } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { demoClaim, demoTotal, inr } from "@/lib/demo";

const STEPS = [
  { label: "Reading boarding pass", detail: `${demoClaim.flight} · ${demoClaim.origin.iata} → ${demoClaim.dest.iata} · PNR ${demoClaim.pnr}` },
  { label: "Reading PIR and receipts", detail: `PIR ${demoClaim.pirNumber} · 2 bags · 9 receipts` },
  { label: "Checking Open-Meteo weather at DEL", detail: "Clear sky, visibility 4.8–6.1 km. No fog." },
  { label: "Applying DGCA CAR & Montreal Convention", detail: "Delay 6h 20m · damaged + delayed baggage" },
  { label: "Stacking Visa Infinite card cover", detail: "Trip-delay and baggage-delay benefits found" },
];

export default function DemoRun() {
  const router = useRouter();
  const [done, setDone] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const step = reduce ? 150 : 650;
    const timers = STEPS.map((_, i) => setTimeout(() => setDone(i + 1), step * (i + 1)));
    return () => timers.forEach(clearTimeout);
  }, []);

  const finished = done >= STEPS.length;

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <div className="reveal text-center">
        <p className="headline text-accent">Live demo</p>
        <h1 className="title-1 mt-2">Analysing a real-world claim</h1>
        <p className="mt-2 text-muted">A 6h 20m Delhi–London delay blamed on fog, plus one damaged and one delayed bag.</p>
      </div>

      <div className="card mt-10 p-2">
        <div className="flex items-center gap-3 rounded-xl bg-fill px-4 py-3">
          <FileText size={18} className="text-muted" aria-hidden />
          <span className="footnote flex-1 truncate">boarding-pass-AI161.pdf · PIR-LHRAI48213.pdf · receipts (9)</span>
          <Plane size={16} className="text-accent" aria-hidden />
        </div>
        <ol className="mt-1">
          {STEPS.map((s, i) => {
            const state = i < done ? "done" : i === done ? "active" : "todo";
            return (
              <li key={s.label} className={`flex items-start gap-3 px-4 py-3.5 transition-opacity duration-300 ${state === "todo" ? "opacity-35" : ""}`}>
                <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${state === "done" ? "bg-ok text-white" : "text-accent"}`}>
                  {state === "done" ? <Check size={13} strokeWidth={3} /> : state === "active" ? <Loader2 size={16} className="animate-spin" /> : <span className="size-1.5 rounded-full bg-muted" />}
                </span>
                <div className="min-w-0">
                  <div className="footnote font-medium">{s.label}</div>
                  {state === "done" && <div className="caption reveal text-muted">{s.detail}</div>}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className={`mt-8 text-center transition-all duration-500 ${finished ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`} aria-live="polite">
        {finished && (
          <>
            <p className="footnote text-muted">Total recoverable</p>
            <p className="display mt-1 tabular-nums">{inr(demoTotal)}</p>
            <button className="btn-primary mt-6 px-6! py-3! text-[17px]!" onClick={() => router.push("/audit/demo")}>
              See the full audit
            </button>
          </>
        )}
      </div>
    </div>
  );
}

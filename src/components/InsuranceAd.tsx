"use client";

import { ShieldCheck, Umbrella, X } from "lucide-react";
import { useState } from "react";

/** Sample sponsored placements. Insurer names are placeholders chosen for the demo. */
const ADS = [
  {
    id: "ztar",
    brand: "Ztar Health Insurance",
    headline: "Delays over 4 hours pay out automatically",
    body: "Flight-delay cover from ₹149 a trip. No forms: we track your flight and pay to your UPI.",
    cta: "Get a quote",
    hue: "#0066cc",
  },
  {
    id: "mivapupa",
    brand: "Miva Pupa Insurance",
    headline: "Baggage cover up to ₹1,00,000",
    body: "Lost, damaged or delayed bags, plus ₹10,000 for essentials while you wait.",
    cta: "See plans",
    hue: "#248a3d",
  },
  {
    id: "fbi",
    brand: "FBI Health Insurance",
    headline: "Annual multi-trip cover for ₹2,999",
    body: "Unlimited international trips, medical cover up to $250,000 and missed connections.",
    cta: "Compare covers",
    hue: "#5e5ce6",
  },
];

export function InsuranceAd({ variant = "card", index = 0 }: { variant?: "card" | "banner" | "rail"; index?: number }) {
  const [hidden, setHidden] = useState(false);
  const [clicked, setClicked] = useState(false);
  if (hidden) return null;
  const ad = ADS[index % ADS.length];

  const Badge = <span className="caption rounded-full bg-fill px-2 py-0.5 font-medium text-muted">Sponsored</span>;
  const Mark = (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: ad.hue }}>
      {index % 2 ? <Umbrella size={20} aria-hidden /> : <ShieldCheck size={20} aria-hidden />}
    </span>
  );
  const Cta = (
    <button className="btn-ghost shrink-0" onClick={() => setClicked(true)}>
      {clicked ? "Quote sent to your email" : ad.cta}
    </button>
  );

  if (variant === "banner")
    return (
      <aside aria-label={`Advertisement: ${ad.brand}`} className="card reveal relative flex flex-wrap items-center gap-4 p-4 pr-9 sm:p-5 sm:pr-10">
        {Mark}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="footnote font-semibold">{ad.brand}</span>
            {Badge}
          </div>
          <p className="footnote mt-0.5 text-ink/80">{ad.headline}. {ad.body}</p>
        </div>
        {Cta}
        <button aria-label="Close ad" className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-fill text-muted hover:text-ink" onClick={() => setHidden(true)}>
          <X size={11} strokeWidth={2.5} aria-hidden />
        </button>
      </aside>
    );

  return (
    <aside aria-label={`Advertisement: ${ad.brand}`} className={`card reveal relative overflow-hidden p-6 ${variant === "rail" ? "" : ""}`}>
      <div className="absolute -top-10 -right-10 size-32 rounded-full opacity-10" style={{ background: ad.hue }} aria-hidden />
      <div className="relative flex items-center gap-3 pr-6">
        {Mark}
        <span className="headline">{ad.brand}</span>
        {Badge}
      </div>
      <p className="headline relative mt-4">{ad.headline}</p>
      <p className="footnote relative mt-1 text-muted">{ad.body}</p>
      <div className="relative mt-5">{Cta}</div>
      <button aria-label="Close ad" className="absolute top-2.5 right-2.5 flex size-5 items-center justify-center rounded-full bg-fill text-muted hover:text-ink" onClick={() => setHidden(true)}>
        <X size={11} strokeWidth={2.5} aria-hidden />
      </button>
    </aside>
  );
}

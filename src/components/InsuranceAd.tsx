"use client";

import { ArrowRight, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/** Official AeroClaim Protection recommendations. Replaces 3rd-party sponsored ads. */
const PLANS = [
  {
    id: "trip_shield",
    brand: "AeroClaim Trip Shield",
    badge: "Official Protection",
    headline: "Baggage & flight cover from ₹149 a trip",
    body: "Lost, damaged or delayed bags covered up to ₹1,00,000, plus automatic delay payouts to your UPI.",
    cta: "See plans",
    href: "/protection",
  },
  {
    id: "annual_pass",
    brand: "AeroClaim Annual Pass",
    badge: "Frequent Flyer Pass",
    headline: "Annual multi-trip cover for ₹2,999/yr",
    body: "Unlimited domestic and international flights covered. Self-transfer connections and priority advocate escalation.",
    cta: "Explore Annual Pass",
    href: "/protection",
  },
  {
    id: "flight_guard",
    brand: "AeroClaim Flight Guard",
    badge: "Automated Payout",
    headline: "Delays over 4 hours pay out automatically",
    body: "Zero paperwork: we monitor live airport telemetry and transfer straight to your UPI if your flight is held up.",
    cta: "Protect this flight",
    href: "/protection",
  },
];

export function InsuranceAd({ variant = "card", index = 0 }: { variant?: "card" | "banner" | "rail"; index?: number }) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  const plan = PLANS[index % PLANS.length];

  const Badge = (
    <span className="caption rounded-full bg-accent-soft px-2.5 py-0.5 font-semibold text-accent">
      {plan.badge}
    </span>
  );

  const IconMark = (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-white shadow-sm">
      <ShieldCheck size={22} aria-hidden />
    </span>
  );

  const CtaLink = (
    <Link
      href={plan.href}
      className="btn-primary shrink-0 py-2! px-4! text-[13px]! inline-flex items-center gap-1.5"
    >
      {plan.cta} <ArrowRight size={14} aria-hidden />
    </Link>
  );

  if (variant === "banner")
    return (
      <aside aria-label={plan.brand} className="card reveal relative flex flex-wrap items-center gap-4 p-4 pr-10 sm:p-5 sm:pr-12">
        {IconMark}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="footnote font-semibold text-ink">{plan.brand}</span>
            {Badge}
          </div>
          <p className="footnote mt-0.5 text-ink/80">
            <span className="font-medium text-ink">{plan.headline}.</span> {plan.body}
          </p>
        </div>
        {CtaLink}
        <button
          aria-label="Close"
          className="absolute top-2.5 right-2.5 flex size-5 items-center justify-center rounded-full bg-fill text-muted hover:text-ink transition-colors"
          onClick={() => setHidden(true)}
        >
          <X size={12} strokeWidth={2.5} aria-hidden />
        </button>
      </aside>
    );

  return (
    <aside aria-label={plan.brand} className="card reveal relative overflow-hidden p-6">
      <div className="absolute -top-10 -right-10 size-32 rounded-full bg-accent/5" aria-hidden />
      <div className="relative flex items-center gap-3 pr-6">
        {IconMark}
        <div>
          <span className="headline block">{plan.brand}</span>
          <div className="mt-1">{Badge}</div>
        </div>
      </div>
      <p className="headline relative mt-4">{plan.headline}</p>
      <p className="footnote relative mt-1 text-muted">{plan.body}</p>
      <div className="relative mt-5">{CtaLink}</div>
      <button
        aria-label="Close"
        className="absolute top-2.5 right-2.5 flex size-5 items-center justify-center rounded-full bg-fill text-muted hover:text-ink transition-colors"
        onClick={() => setHidden(true)}
      >
        <X size={12} strokeWidth={2.5} aria-hidden />
      </button>
    </aside>
  );
}

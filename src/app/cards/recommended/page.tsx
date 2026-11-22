"use client";

import { Check, ExternalLink, Info } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BankMark, PARTNER_CARDS } from "@/lib/partnerCards";

export default function RecommendedCards() {
  const [applied, setApplied] = useState<string | null>(null);

  return (
    <div className="reveal mx-auto max-w-5xl px-4 py-12">
      <div className="px-1 text-center">
        <p className="eyebrow">Recommended cards</p>
        <h1 className="title-1 mt-2 text-balance">Cards that pay out when your flight doesn&apos;t go to plan</h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted">
          Book your tickets on one of these cards and you get trip-delay and baggage cover automatically, on top of what the airline owes you. We check your card cover on every claim you file.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {PARTNER_CARDS.map((c) => (
          <article key={c.id} className={`card scroll-rise flex flex-col p-6 ${c.featured ? "shadow-[inset_0_0_0_2px_var(--accent),var(--shadow-card)]" : ""}`}>
            <div className="relative aspect-[1.586] w-full overflow-hidden rounded-2xl p-4 text-white shadow-[var(--shadow-raised)]" style={{ background: `linear-gradient(135deg, ${c.hue}, #0e151d)` }}>
              <div className="absolute -top-10 -right-10 size-32 rounded-full bg-white/10" aria-hidden />
              <div className="flex items-center justify-between">
                <span className="footnote font-semibold">{c.bank}</span>
                {c.featured && <span className="caption rounded-full bg-white/20 px-2 py-0.5 font-semibold">Top pick</span>}
              </div>
              <div className="absolute bottom-4 left-4 headline">{c.card}</div>
              <div className="caption absolute right-4 bottom-4 font-semibold tracking-[0.08em]">{c.network.toUpperCase()}</div>
            </div>

            <div className="mt-5 flex items-center gap-2.5">
              <BankMark card={c} size={28} />
              <div>
                <div className="headline">{c.card}</div>
                <div className="caption text-muted">Best for {c.bestFor.toLowerCase()}</div>
              </div>
            </div>

            <dl className="footnote mt-4 grid grid-cols-2 gap-y-1.5">
              <dt className="text-muted">Travel cover</dt>
              <dd className="text-right font-semibold">{c.travelCover}</dd>
              <dt className="text-muted">Annual fee</dt>
              <dd className="text-right">{c.annualFee}</dd>
            </dl>

            <ul className="mt-4 flex-1 space-y-2 border-t border-line pt-4">
              {c.highlights.map((h) => (
                <li key={h} className="footnote flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-ok" aria-hidden />{h}</li>
              ))}
            </ul>

            <button
              className={`${c.featured ? "btn-primary" : "btn-ghost"} mt-6 w-full py-2.5!`}
              onClick={() => setApplied(c.id)}
              disabled={applied === c.id}
            >
              {applied === c.id ? "Opening the bank's application…" : <>Apply on {c.bank} <ExternalLink size={14} aria-hidden /></>}
            </button>
          </article>
        ))}
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <p className="caption flex items-start gap-2 text-muted">
          <Info size={14} className="mt-px shrink-0" aria-hidden />
          <span>
            <sup>◊</sup> Cover applies only when the full fare is paid on the card, and depends on the bank&apos;s policy terms. Card approval is at the bank&apos;s discretion.
            AeroClaim may earn a commission when you apply through these links. It doesn&apos;t change the price or terms you get, and doesn&apos;t affect which claims we accept.
            Banks and cards shown are sample partners for this demo.
          </span>
        </p>
        <Link href="/cards" className="btn-ghost justify-self-start">Already have a card? Check its cover</Link>
      </div>
    </div>
  );
}

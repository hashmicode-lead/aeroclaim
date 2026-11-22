"use client";

import { Building2, CheckCircle2, Download, FileText, Landmark, Scale, Send, Video } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { demoClaim, demoTotal, inr, packets, timeline } from "@/lib/demo";

const ICONS = { nodal: Send, airsewa: Landmark, ejagriti: Scale, chargeback: FileText } as const;

export default function PacketHub() {
  const [corporate, setCorporate] = useState(false);
  const [sent, setSent] = useState<Record<string, boolean>>({ nodal: true });

  return (
    <div className="reveal mx-auto max-w-4xl px-4 py-8">
      <Link href="/payout/demo" className="footnote text-accent hover:underline">‹ Payout track</Link>
      <header className="mt-5 flex flex-wrap items-end justify-between gap-4 px-1">
        <div>
          <p className="eyebrow">Step 4 of 4 · Action hub</p>
          <h1 className="title-1 mt-2">Your filing packets are ready</h1>
          <p className="footnote mt-1.5 text-muted">{demoClaim.flight} · PNR {demoClaim.pnr} · {inr(demoTotal)} claimed</p>
        </div>
        <label className="flex cursor-pointer items-center gap-3 rounded-full bg-surface px-4 py-2 shadow-[var(--shadow-card)]">
          <Building2 size={16} className="text-muted" aria-hidden />
          <span className="footnote">Corporate booking</span>
          <span className={`relative h-[22px] w-9 rounded-full transition-colors duration-200 ${corporate ? "bg-ok" : "bg-fill"}`}>
            <input type="checkbox" role="switch" className="sr-only" checked={corporate} onChange={(e) => setCorporate(e.target.checked)} />
            <span className={`absolute top-0.5 left-0.5 size-[18px] rounded-full bg-white shadow transition-transform duration-200 ease-[var(--ease-out-quint)] ${corporate ? "translate-x-3.5" : ""}`} />
          </span>
        </label>
      </header>

      {corporate && (
        <p className="footnote reveal mt-4 rounded-2xl bg-info-soft p-4 text-ink">
          Filed on behalf of <strong>Northwind Analytics Pvt Ltd</strong>. Recovered amounts go to the company travel account, and the claim appears in the corporate PNR audit.
        </p>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {packets.map((p) => {
          const Icon = ICONS[p.type];
          return (
            <div key={p.type} className="card flex flex-col p-6">
              <div className="flex items-start justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Icon size={20} aria-hidden />
                </div>
                {sent[p.type] ? (
                  <span className="caption inline-flex items-center gap-1 rounded-full bg-ok-soft px-2 py-0.5 font-semibold text-ok"><CheckCircle2 size={12} aria-hidden /> Sent</span>
                ) : (
                  <span className="caption text-muted">{p.pages} pages</span>
                )}
              </div>
              <div className="headline mt-4">{p.title}</div>
              <p className="footnote mt-1 flex-1 text-muted">{p.desc}</p>
              <div className="mt-5 flex gap-2">
                <Link href={`/packets/demo/${p.type}`} className="btn-ghost flex-1"><Download size={15} aria-hidden /> PDF</Link>
                <button className="btn-primary flex-1" disabled={sent[p.type]} onClick={() => setSent((s) => ({ ...s, [p.type]: true }))}>
                  {sent[p.type] ? "Sent" : "Send"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
        <section>
          <h2 className="title-2 mb-2 px-1">Claim tracker</h2>
          <div className="card p-6">
            <ol className="grid gap-4 sm:grid-cols-3">
              {timeline.map((t, i) => (
                <li key={t.label} className="flex gap-3">
                  <span className={`caption flex size-6 shrink-0 items-center justify-center rounded-full font-semibold ${t.done ? "bg-ok text-white" : "bg-fill text-muted"}`}>
                    {t.done ? <CheckCircle2 size={14} aria-hidden /> : i + 1}
                  </span>
                  <div>
                    <div className={`footnote font-medium ${t.done ? "" : "text-muted"}`}>{t.label}</div>
                    <div className="caption text-muted">{t.date}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section>
          <h2 className="title-2 mb-2 px-1">Need a lawyer?</h2>
          <div className="card p-6">
            <div className="flex -space-x-2">
              {["RK", "SM", "AV"].map((x, i) => (
                <span key={x} className={`flex size-9 items-center justify-center rounded-full text-[11px] font-semibold text-white ring-2 ring-surface ${["bg-[#0066cc]", "bg-[#5e5ce6]", "bg-[#248a3d]"][i]}`}>{x}</span>
              ))}
            </div>
            <p className="footnote mt-3 text-muted">This claim is above ₹50,000. A verified consumer advocate can review your brief on a video call, usually within 2 hours.</p>
            <Link href="/advocate/demo" className="btn-primary mt-4 w-full"><Video size={16} aria-hidden /> Start video consult</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

import { ArrowRight, BadgeCheck, CloudSun, CreditCard, Link2, Luggage, Plane } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Countdown } from "@/components/client";
import { InsuranceAd } from "@/components/InsuranceAd";
import { Section } from "@/components/ui";
import { demoBreakdown, demoClaim as c, demoDeadlines, demoTotal, demoWeather as w, inr } from "@/lib/demo";
import { formatDate } from "@/lib/time";

export const metadata: Metadata = { title: "Audit · AI 161" };

const TRACK_ICON = { Airline: Plane, Card: CreditCard } as const;

export default function AuditPage() {
  const airline = demoBreakdown.filter((b) => b.track === "Airline").reduce((s, b) => s + b.inr, 0);
  const card = demoTotal - airline;

  return (
    <div className="reveal mx-auto max-w-4xl px-4 py-8">
      <Link href="/dashboard" className="footnote text-accent hover:underline">‹ My claims</Link>

      <header className="mt-5 px-1">
        <p className="eyebrow">Claim {c.ref} · PNR {c.pnr}</p>
        <h1 className="title-1 mt-2">
          {c.origin.city} <span className="text-muted">→</span> {c.dest.city}
        </h1>
        <p className="footnote mt-1.5 text-muted">
          {c.airline} {c.flight} · 19 Nov 2026 · scheduled {c.scheduled}, departed {c.actual} · {c.passengers} passengers
        </p>
      </header>

      {/* Hero */}
      <section className="card mt-6 p-7 sm:p-9">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="footnote font-medium text-muted">Total recoverable</p>
            <p className="display mt-1 tabular-nums">{inr(demoTotal)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="caption inline-flex items-center gap-1.5 rounded-full bg-ok-soft px-3 py-1.5 font-semibold text-ok">
              <BadgeCheck size={14} aria-hidden /> Weather excuse disproved
            </span>
            <span className="caption inline-flex items-center gap-1.5 rounded-full bg-info-soft px-3 py-1.5 font-semibold text-info">
              <Link2 size={14} aria-hidden /> {c.bookingType}: airline liable end to end
            </span>
          </div>
        </div>

        {/* Split bar */}
        <div className="mt-7">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-fill" role="img" aria-label={`Airline ${inr(airline)}, card cover ${inr(card)}`}>
            <div className="bg-accent" style={{ width: `${(airline / demoTotal) * 100}%` }} />
            <div className="bg-[#5e5ce6]" style={{ width: `${(card / demoTotal) * 100}%` }} />
          </div>
          <div className="caption mt-2 flex gap-5 text-muted">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-accent" /> Airline {inr(airline)}</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#5e5ce6]" /> Visa Infinite cover {inr(card)}</span>
          </div>
        </div>

        <ul className="mt-6 divide-y divide-line border-t border-line">
          {demoBreakdown.map((b) => {
            const Icon = TRACK_ICON[b.track as keyof typeof TRACK_ICON];
            return (
              <li key={b.label} className="flex items-start gap-3 py-3.5">
                <Icon size={18} className={`mt-0.5 shrink-0 ${b.track === "Card" ? "text-[#5e5ce6]" : "text-accent"}`} aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="footnote font-medium">{b.label}</div>
                  <div className="caption text-muted">{b.basis}</div>
                </div>
                <div className="headline tabular-nums">{inr(b.inr)}</div>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/payout/demo" className="btn-primary px-5! py-2.5!">Choose payout track <ArrowRight size={16} aria-hidden /></Link>
          <Link href="/packets/demo" className="btn-ghost px-5! py-2.5!">Skip to packets</Link>
        </div>
      </section>

      <div className="mt-10 grid gap-10">
        {/* Weather */}
        <Section
          title="Weather verification"
          aside={<span className="caption text-muted">Source: Open-Meteo hourly · {w.airport}</span>}
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-ok-soft text-ok">
              <CloudSun size={28} aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className="headline">Clear sky at Delhi: no fog recorded</div>
              <p className="footnote mt-0.5 text-muted">{w.summary}</p>
            </div>
            <div className="rounded-xl bg-fill px-3 py-2 text-right">
              <div className="caption text-muted">Airline said</div>
              <div className="footnote font-medium line-through decoration-bad/60">{c.excuse}</div>
            </div>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="footnote w-full min-w-[420px] tabular-nums">
              <thead className="caption text-left text-muted">
                <tr>
                  <th className="pb-2 font-medium">IST</th>
                  <th className="pb-2 font-medium">Conditions</th>
                  <th className="pb-2 text-right font-medium">Visibility</th>
                  <th className="pb-2 text-right font-medium">Wind</th>
                  <th className="pb-2 text-right font-medium">Rain</th>
                </tr>
              </thead>
              <tbody>
                {w.hours.map((h) => (
                  <tr key={h.t} className={`border-t border-line ${h.t === "02:00" ? "bg-accent-soft/60 font-medium" : ""}`}>
                    <td className="py-2 font-mono">{h.t}{h.t === "02:00" && <span className="caption ml-2 font-sans text-accent">departure</span>}</td>
                    <td className="py-2">{h.cond}</td>
                    <td className="py-2 text-right">{h.vis.toFixed(1)} km</td>
                    <td className="py-2 text-right">{h.wind} km/h</td>
                    <td className="py-2 text-right">{h.precip} mm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="caption mt-4 text-muted">
            Fog that disrupts operations at Delhi typically means visibility under 550 m (CAT I minima). Even in genuine fog, meals and refreshments remain owed under the DGCA duty of care.
          </p>
        </Section>

        {/* Deadlines */}
        <Section title="Legal clocks">
          <div className="grid gap-3 sm:grid-cols-2">
            {demoDeadlines.slice(0, 2).map((d) => (
              <div key={d.id} className="rounded-2xl bg-fill p-5">
                <div className="flex items-center gap-2">
                  <Luggage size={16} className="text-warn" aria-hidden />
                  <span className="footnote font-medium">{d.title}</span>
                </div>
                <div className="title-1 mt-3"><Countdown due={d.due} /></div>
                <div className="caption mt-1 text-muted">Due {formatDate(d.due)} · {d.basis}</div>
              </div>
            ))}
          </div>
          <ul className="mt-4 divide-y divide-line">
            {demoDeadlines.slice(2).map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <div className="footnote font-medium">{d.title}</div>
                  <div className="caption text-muted">{d.basis}</div>
                </div>
                <div className="text-right">
                  <div className="footnote tabular-nums">{formatDate(d.due)}</div>
                  <div className="caption"><Countdown due={d.due} /></div>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        {/* PNR */}
        <Section title="Booking structure">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl p-5 ring-2 ring-accent">
              <div className="flex items-center justify-between">
                <span className="headline">Single PNR</span>
                <span className="caption rounded-full bg-accent px-2 py-0.5 font-semibold text-white">This booking</span>
              </div>
              <p className="footnote mt-2 text-muted">One ticket to the final destination, so Air India is liable for delays and baggage on every leg, and must re-route you at no cost.</p>
            </div>
            <div className="rounded-2xl bg-fill p-5 opacity-70">
              <span className="headline">Separate PNRs</span>
              <p className="footnote mt-2 text-muted">On a self-transfer, the first airline isn&apos;t liable for the onward flight. Missed connections are routed to card or travel insurance instead.</p>
            </div>
          </div>
        </Section>
        <section>
          <h2 className="title-2 mb-2 px-1">Cover your next trip</h2>
          <InsuranceAd variant="banner" index={1} />
        </section>
      </div>
    </div>
  );
}

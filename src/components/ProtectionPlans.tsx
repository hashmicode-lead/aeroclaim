"use client";

import { BellRing, Check, CloudSun, Link2Off, ShieldCheck, Smartphone } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Tab = "trip" | "annual" | "business";
type Route = "domestic" | "international";
type Pnr = "single" | "separate";

/** Single-trip price grid: domestic ₹149–₹299, international or separate-PNR ₹499–₹999. */
const TRIP_PRICE: Record<Route, Record<Pnr, number>> = {
  domestic: { single: 149, separate: 299 },
  international: { single: 499, separate: 999 },
};

const BENEFITS = [
  { Icon: Smartphone, t: "Automatic flight tracking & UPI payouts", d: "We watch your flight. If it's delayed past the threshold, the payout goes to your UPI ID. No forms, no follow-up." },
  { Icon: Link2Off, t: "Covers separate-PNR & rule gaps", d: "Self-transfers and situations airline rules don't cover, like a missed connection on two tickets, are protected." },
  { Icon: BellRing, t: "7-day, 21-day & PIR deadline protection", d: "We prompt you for the PIR at the belt and track every baggage deadline, so a missed window never costs you." },
  { Icon: CloudSun, t: "One timeline, weather proof & escalation", d: "Your airline claim, card cover and insurance in one timeline, with Open-Meteo weather proof and escalation if anyone refuses." },
];

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

export function ProtectionPlans({ compact = false }: { compact?: boolean }) {
  const [tab, setTab] = useState<Tab>("trip");
  const [route, setRoute] = useState<Route>("domestic");
  const [pnr, setPnr] = useState<Pnr>("single");
  const [chosen, setChosen] = useState<string | null>(null);
  const price = TRIP_PRICE[route][pnr];

  return (
    <div>
      {/* Benefits */}
      <div className={`grid gap-3 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
        {BENEFITS.map((b) => (
          <div key={b.t} className={`${compact ? "rounded-2xl bg-fill" : "card scroll-rise"} p-5`}>
            <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent"><b.Icon size={20} aria-hidden /></span>
            <div className="headline mt-4">{b.t}</div>
            <p className="footnote mt-1 text-muted">{b.d}</p>
          </div>
        ))}
      </div>

      {/* Plan type */}
      <div className="mt-10 flex justify-center">
        <div className="segmented" role="radiogroup" aria-label="Plan type">
          {([["trip", "Single trip"], ["annual", "Annual"], ["business", "Business"]] as [Tab, string][]).map(([id, l]) => (
            <label key={id} data-on={tab === id}>
              <input type="radio" name="protection-tab" className="sr-only" checked={tab === id} onChange={() => setTab(id)} />
              {l}
            </label>
          ))}
        </div>
      </div>

      <div key={tab} className="reveal mx-auto mt-6 max-w-3xl">
        {tab === "trip" && (
          <div className="card grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
            <div className="space-y-5">
              <div>
                <span className="label">Where are you flying?</span>
                <div className="segmented">
                  {(["domestic", "international"] as Route[]).map((r) => (
                    <label key={r} data-on={route === r} className="capitalize">
                      <input type="radio" name="route" className="sr-only" checked={route === r} onChange={() => setRoute(r)} />
                      {r}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <span className="label">How is it booked?</span>
                <div className="segmented">
                  {([["single", "One PNR"], ["separate", "Separate PNRs"]] as [Pnr, string][]).map(([p, l]) => (
                    <label key={p} data-on={pnr === p}>
                      <input type="radio" name="pnr" className="sr-only" checked={pnr === p} onChange={() => setPnr(p)} />
                      {l}
                    </label>
                  ))}
                </div>
                <p className="hint">Separate PNRs means self-transfer tickets: the first airline isn&apos;t responsible if you miss the second flight.</p>
              </div>
              <ul className="space-y-1.5">
                {["Delay payout to your UPI when you're held up past the threshold", "Baggage delay and damage cover", ...(pnr === "separate" ? ["Missed-connection cover across separate tickets"] : []), ...(route === "international" ? ["International baggage and connection cover"] : [])].map((x) => (
                  <li key={x} className="footnote flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-ok" aria-hidden />{x}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-fill p-6 text-center sm:min-w-[200px]">
              <div className="caption text-muted">Per trip</div>
              <div className="display mt-1 text-[48px]! tabular-nums">{inr(price)}</div>
              <div className="caption mt-1 text-muted">{route === "domestic" ? "Domestic ₹149–₹299" : "International ₹499–₹999"}</div>
              <button className="btn-primary mt-5 w-full" onClick={() => setChosen(`Single trip · ${inr(price)}`)}>Protect this trip</button>
            </div>
          </div>
        )}

        {tab === "annual" && (
          <div className="card flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="headline">Annual multi-trip</span>
                <span className="caption rounded-full bg-accent px-2 py-0.5 font-semibold text-white">Best value</span>
              </div>
              <p className="footnote mt-1 text-muted">For anyone who flies more than 10 times a year.</p>
              <ul className="mt-4 space-y-1.5">
                {["Unlimited domestic and international trips", "Separate-PNR and missed-connection cover", "Baggage deadline and PIR protection on every trip", "Priority escalation support"].map((x) => (
                  <li key={x} className="footnote flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-ok" aria-hidden />{x}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-fill p-6 text-center sm:min-w-[200px]">
              <div className="caption text-muted">Per year</div>
              <div className="display mt-1 text-[48px]! tabular-nums">₹2,999</div>
              <div className="caption mt-1 text-muted">about ₹250 a month</div>
              <button className="btn-primary mt-5 w-full" onClick={() => setChosen("Annual · ₹2,999/yr")}>Get annual cover</button>
            </div>
          </div>
        )}

        {tab === "business" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { n: "Team protection", p: "₹4,999", u: "per month", pts: ["Every employee trip protected", "Separate-PNR and connection cover", "Payouts to the company travel account", "Monthly protection & recovery report"], featured: true, cta: "Start a trial" },
              { n: "Enterprise", p: "Custom", u: "annual contract", pts: ["Group policy for your whole travel desk", "SSO and role-based access", "Dedicated claims manager", "API access"], cta: "Talk to sales" },
            ].map((pl) => (
              <div key={pl.n} className={`card flex flex-col p-6 ${pl.featured ? "shadow-[inset_0_0_0_2px_var(--accent),var(--shadow-card)]" : ""}`}>
                <div className="headline">{pl.n}</div>
                <div className="mt-3 flex items-baseline gap-2"><span className="title-1 tabular-nums">{pl.p}</span><span className="footnote text-muted">{pl.u}</span></div>
                <ul className="mt-4 flex-1 space-y-1.5">
                  {pl.pts.map((x) => <li key={x} className="footnote flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-ok" aria-hidden />{x}</li>)}
                </ul>
                <Link href="/signup?as=businesses" className={`${pl.featured ? "btn-primary" : "btn-ghost"} mt-6 w-full`}>{pl.cta}</Link>
              </div>
            ))}
          </div>
        )}

        {chosen && (
          <p role="status" className="footnote reveal mt-4 flex items-center justify-center gap-2 text-ok">
            <ShieldCheck size={16} aria-hidden /> {chosen} selected. Sign up to activate it. (Demo: no payment is taken.)
          </p>
        )}
        <p className="caption mt-5 text-center text-muted">
          Insurance is underwritten by IRDAI-registered partner insurers. Cover, limits and exclusions are set out in each policy wording. Prices include GST. Demo plans.
        </p>
      </div>
    </div>
  );
}

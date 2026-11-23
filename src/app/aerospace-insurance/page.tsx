"use client";

import {
  AlertTriangle,
  ArrowRight,
  Box,
  ChevronDown,
  CloudSun,
  FileCheck2,
  Luggage,
  Plane,
  Scale,
  Shield,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const TRACKS: { Icon: LucideIcon; title: string; desc: string; points: string[] }[] = [
  {
    Icon: Plane,
    title: "Passenger & Corporate Disruption Cover",
    desc: "Covers weather/ATC force majeure delays, separate-PNR missed connections, and delayed/damaged baggage top-ups beyond DGCA CAR and Montreal Convention (1,519 SDR) limits.",
    points: [
      "Force majeure delay cover when airline liability ends",
      "Separate-PNR missed connection protection",
      "Baggage delay/damage top-up beyond Montreal limits",
      "Automatic weather verification via Open-Meteo",
    ],
  },
  {
    Icon: Box,
    title: "Air-Cargo & Aerospace Transit Risk",
    desc: "Tracks transit disruptions, logs damage/delay timelines, and compiles insurer/carrier claim bundles for sensitive avionics, parts, and high-value freight.",
    points: [
      "Transit disruption tracking for high-value freight",
      "Damage/delay timeline documentation",
      "Insurer-ready claim bundles for avionics and parts",
      "Automated carrier liability assessment",
    ],
  },
  {
    Icon: Scale,
    title: "Insurer Dispute & IRDAI Escalation",
    desc: "Audits rejected insurance claims against policy exclusions, attaches Open-Meteo airport weather telemetry, and formats escalation briefs for IRDAI Bima Bharosa / Insurance Ombudsman.",
    points: [
      "Policy exclusion audit for rejected claims",
      "Airport weather telemetry evidence attachment",
      "IRDAI Bima Bharosa escalation briefs",
      "Insurance Ombudsman complaint formatting",
    ],
  },
];

const SCENARIOS = [
  {
    id: "weather",
    title: "Weather / ATC Delay",
    airline: "Airlines are not liable for genuine extraordinary circumstances (force majeure). However, they still owe meals, hotel if overnight, and re-routing or refund.",
    insurance: "Travel insurance with delay cover pays out after 4–12 hours (policy-dependent). Premium credit cards often include automatic trip-delay insurance.",
    cta: "Run a weather check",
  },
  {
    id: "connection",
    title: "Separate-PNR Connection",
    airline: "If flights are on separate PNRs, the airline on the first flight has no obligation for the missed connection. Only same-PNR connections are protected under DGCA rules.",
    insurance: "Missed-connection cover from travel insurance or premium card policies can reimburse the cost of the second ticket and interim expenses.",
    cta: "Check your card cover",
  },
  {
    id: "baggage",
    title: "International Baggage >₹1.8L",
    airline: "Montreal Convention limits carrier liability to ~1,519 SDR (≈₹1.8 lakh) per passenger. Claims above this need special declaration of value at check-in.",
    insurance: "Baggage insurance and premium card baggage cover can stack on top of the airline payout, covering the excess above Montreal limits.",
    cta: "Start a baggage claim",
  },
  {
    id: "cargo",
    title: "Air-Cargo / Equipment Transit",
    airline: "Carrier liability for cargo is limited under the Montreal Convention. Damage must be reported in writing within 14 days (or 21 for delay). The shipper must prove the damage occurred during transit.",
    insurance: "Cargo/transit insurance covers the full declared value. AeroClaim compiles the insurer-ready evidence bundle with damage timeline and weather data.",
    cta: "Build a cargo claim bundle",
  },
];

export default function AerospaceInsurancePage() {
  const [selected, setSelected] = useState("weather");
  const scenario = SCENARIOS.find((s) => s.id === selected)!;

  return (
    <div className="mx-auto max-w-5xl px-4">
      {/* Hero */}
      <section className="reveal pt-16 pb-12 text-center sm:pt-24">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <Shield size={26} aria-hidden />
        </span>
        <p className="headline mt-5 text-accent">Aerospace & Aviation Insurance</p>
        <h1 className="display mx-auto mt-2 max-w-3xl text-balance">
          Protection where carrier liability ends.
        </h1>
        <p className="title-2 mx-auto mt-5 max-w-2xl font-normal! text-balance text-muted">
          AeroClaim OS bridges the gap between airline obligations and insurance coverage — across
          commercial passenger disruptions, corporate air travel, and high-value air-cargo/equipment
          transit — by verifying weather and force majeure claims and preparing insurer-ready evidence
          packets.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <Link href="/signup" className="btn-primary px-6! py-3! text-[17px]!">
            Check your cover
          </Link>
          <Link href="/contact" className="text-[17px] text-accent hover:underline">
            Talk to us <span aria-hidden>›</span>
          </Link>
        </div>
      </section>

      {/* 3 Coverage Tracks */}
      <section className="mt-4" aria-labelledby="tracks-title">
        <h2 id="tracks-title" className="title-1 scroll-rise text-center">
          Coverage & Protection Tracks
        </h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {TRACKS.map((track) => (
            <div key={track.title} className="card scroll-rise flex flex-col p-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <track.Icon size={22} aria-hidden />
              </span>
              <div className="headline mt-4">{track.title}</div>
              <p className="footnote mt-1 flex-1 text-muted">{track.desc}</p>
              <ul className="mt-4 space-y-2">
                {track.points.map((p) => (
                  <li key={p} className="footnote flex gap-2">
                    <ShieldCheck size={16} className="mt-0.5 shrink-0 text-ok" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Check Cover Widget */}
      <section className="mt-20" aria-labelledby="check-cover-title">
        <h2 id="check-cover-title" className="title-1 scroll-rise text-center">
          Check Cover & Exclusions
        </h2>
        <p className="footnote scroll-rise mx-auto mt-2 max-w-xl text-center text-muted">
          Select a scenario to see what the airline covers vs. where insurance or card protection
          stacks on top.
        </p>

        <div className="card scroll-rise mt-8 overflow-hidden">
          {/* Scenario selector */}
          <div className="flex flex-wrap border-b border-line">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(s.id)}
                className={`flex-1 min-w-[140px] px-4 py-3.5 text-center transition-colors ${
                  selected === s.id
                    ? "border-b-2 border-accent bg-accent-soft font-semibold text-accent"
                    : "text-muted hover:bg-surface-2 hover:text-ink"
                }`}
              >
                <span className="footnote">{s.title}</span>
              </button>
            ))}
          </div>

          <div key={selected} className="reveal grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
            <div>
              <div className="flex items-center gap-2">
                <Plane size={18} className="text-accent" aria-hidden />
                <span className="headline text-accent">Airline covers</span>
              </div>
              <p className="footnote mt-2 text-ink/80">{scenario.airline}</p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-ok" aria-hidden />
                <span className="headline text-ok">Insurance / card stacks</span>
              </div>
              <p className="footnote mt-2 text-ink/80">{scenario.insurance}</p>
            </div>
          </div>

          <div className="border-t border-line bg-surface-2 px-6 py-4 text-center sm:px-8">
            <Link
              href={selected === "connection" ? "/cards" : "/claims/new"}
              className="btn-primary"
            >
              {scenario.cta} <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-20 grid gap-3 sm:grid-cols-3" aria-label="Market context">
        <div className="card scroll-rise p-6 text-center">
          <div className="title-1 text-accent tabular-nums">~15 out of 100</div>
          <div className="footnote mt-1 text-muted">travellers are affected by disruptions annually</div>
        </div>
        <div className="card scroll-rise p-6 text-center">
          <div className="title-1 text-accent tabular-nums">Under 5%</div>
          <div className="footnote mt-1 text-muted">of affected travellers file for compensation</div>
        </div>
        <div className="card scroll-rise p-6 text-center">
          <div className="title-1 text-accent tabular-nums">₹1.8 lakh</div>
          <div className="footnote mt-1 text-muted">maximum per-passenger baggage liability (Montreal Convention)</div>
        </div>
      </section>

      {/* Benefits for well-planned travellers */}
      <section className="mt-20" aria-labelledby="benefits-title">
        <h2 id="benefits-title" className="title-1 scroll-rise text-center">
          Even well-planned travellers need a safety net
        </h2>
        <p className="footnote scroll-rise mx-auto mt-2 max-w-xl text-center text-muted">
          No amount of planning protects against airline failures, weather delays, or baggage
          mishandling. Here&apos;s what AeroClaim adds for disciplined travellers.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="card scroll-rise p-6">
            <CloudSun size={22} className="text-accent" aria-hidden />
            <div className="headline mt-4">Weather-excuse verification</div>
            <p className="footnote mt-1 text-muted">
              Airlines frequently blame weather even when skies were clear. We automatically
              cross-check airport weather via Open-Meteo so you know if the excuse holds up.
            </p>
          </div>
          <div className="card scroll-rise p-6">
            <FileCheck2 size={22} className="text-accent" aria-hidden />
            <div className="headline mt-4">Card & policy cover check</div>
            <p className="footnote mt-1 text-muted">
              Check whether your travel card or existing policy already covers flight delays,
              missed connections, or baggage damage — before or right after a trip.
            </p>
          </div>
          <div className="card scroll-rise p-6">
            <Luggage size={22} className="text-accent" aria-hidden />
            <div className="headline mt-4">Baggage deadline tracking</div>
            <p className="footnote mt-1 text-muted">
              Track 7-day (damage) and 21-day (delay) baggage windows with reminders, and
              coordinate airline claims alongside credit-card/travel insurance from one place.
            </p>
          </div>
          <div className="card scroll-rise p-6">
            <AlertTriangle size={22} className="text-accent" aria-hidden />
            <div className="headline mt-4">Customised gap protection</div>
            <p className="footnote mt-1 text-muted">
              Tailored add-on protection for specific blind spots — separate-PNR connections,
              baggage delay top-ups, or short-notice disruption cover — where standard rules stop.
            </p>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="card scroll-rise mt-20 flex flex-col items-center gap-4 p-10 text-center">
        <Shield size={28} className="text-accent" aria-hidden />
        <h2 className="title-1 text-balance">Check your protection gaps</h2>
        <p className="footnote max-w-md text-muted">
          Run a free cover check to see where airline rules, your card insurance, and travel policies
          overlap — and where they don&apos;t.
        </p>
        <Link href="/signup" className="btn-primary px-6! py-3! text-[17px]! bg-[#0066CC]">
          Start a free cover check
        </Link>
      </section>

      {/* Compliance footer */}
      <div className="mt-12 mb-8 rounded-2xl bg-surface-2 px-6 py-4">
        <p className="caption text-muted">
          <span className="font-semibold text-ink">Disclaimer:</span> AeroClaim OS is a
          claim-automation and workflow platform — not a licensed insurer or insurance broker. All
          insurance coverage referenced on this page is governed by the terms of the underlying
          policy issued by the respective insurer. AeroClaim does not underwrite, sell, or
          distribute insurance products. Partner mentions are for informational purposes only. For
          insurance regulatory queries, refer to IRDAI (
          <a
            href="https://www.irdai.gov.in/"
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:underline"
          >
            irdai.gov.in
          </a>
          ).
        </p>
      </div>
    </div>
  );
}

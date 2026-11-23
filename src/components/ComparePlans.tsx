"use client";

import { Check, Minus, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { PROTECTION_LABEL, setProtection, useProtection, type ProtectionTier } from "./session";

type Cell = { ok: boolean; note: string };
type ColId = "airline" | ProtectionTier;

const COLS: { id: ColId; name: string; price: string; unit: string; popular?: boolean }[] = [
  { id: "airline", name: "Airline Rules Only", price: "₹0", unit: "what the law gives you" },
  { id: "trip_shield", name: "AeroClaim Trip Shield", price: "₹199", unit: "per trip", popular: true },
  { id: "annual_pass", name: "AeroClaim Annual Pass", price: "₹2,999", unit: "per year" },
];

const ROWS: { label: string; cells: Record<ColId, Cell> }[] = [
  {
    label: "Weather / ATC delays",
    cells: {
      airline: { ok: false, note: "Meals only, no cash" },
      trip_shield: { ok: true, note: "₹2,500 after 4 hours" },
      annual_pass: { ok: true, note: "₹5,000 after 4 hours" },
    },
  },
  {
    label: "Separate-PNR missed connections",
    cells: {
      airline: { ok: false, note: "Not covered" },
      trip_shield: { ok: true, note: "New ticket up to ₹10,000" },
      annual_pass: { ok: true, note: "New ticket up to ₹25,000" },
    },
  },
  {
    label: "Baggage top-up",
    cells: {
      airline: { ok: false, note: "Airline cap only" },
      trip_shield: { ok: true, note: "+ ₹25,000" },
      annual_pass: { ok: true, note: "+ ₹50,000" },
    },
  },
  {
    label: "Automated UPI payouts",
    cells: {
      airline: { ok: false, note: "You chase the airline" },
      trip_shield: { ok: true, note: "Paid automatically" },
      annual_pass: { ok: true, note: "Paid automatically" },
    },
  },
  {
    label: "Escalation packets",
    cells: {
      airline: { ok: false, note: "File it yourself" },
      trip_shield: { ok: true, note: "AirSewa & e-Jagriti" },
      annual_pass: { ok: true, note: "Priority, with advocate" },
    },
  },
];

const COMPLIANCE =
  "Trip Shield and Annual Pass cover is underwritten by licensed partner insurers registered with IRDAI. AeroClaim is not an insurer. Benefits, limits and exclusions are as per each policy wording. Prices include GST.";

function Mark({ cell }: { cell: Cell }) {
  return cell.ok ? (
    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-ok text-white"><Check size={12} strokeWidth={3} aria-hidden /></span>
  ) : (
    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-fill text-muted"><Minus size={12} strokeWidth={3} aria-hidden /></span>
  );
}

function SelectButton({ tier, featured }: { tier: ProtectionTier; featured?: boolean }) {
  const current = useProtection();
  const on = current === tier;
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => setProtection(on ? null : tier)}
      className={`${on ? "btn bg-ok-soft text-ok" : featured ? "btn-primary" : "btn-ghost"} w-full`}
    >
      {on ? <><Check size={15} strokeWidth={3} aria-hidden /> Selected</> : "Select Plan"}
    </button>
  );
}

/** Full comparison table (home page). */
function CompareTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-separate border-spacing-0">
        <caption className="sr-only">Compare protection plans</caption>
        <thead>
          <tr>
            <th className="w-[28%]" />
            {COLS.map((c) => (
              <th key={c.id} scope="col" className={`px-3 pt-5 pb-4 text-left align-bottom font-normal ${c.popular ? "rounded-t-2xl bg-accent-soft" : ""}`}>
                {c.popular && <span className="caption mb-2 inline-block rounded-full bg-accent px-2 py-0.5 font-semibold text-white">Most Popular</span>}
                <div className="headline">{c.name}</div>
                <div className="mt-1 flex items-baseline gap-1.5"><span className="title-2 tabular-nums">{c.price}</span><span className="caption text-muted">{c.unit}</span></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.label}>
              <th scope="row" className="footnote border-t border-line py-3.5 pr-3 text-left font-medium">{r.label}</th>
              {COLS.map((c) => (
                <td key={c.id} className={`border-t border-line px-3 py-3.5 ${c.popular ? "bg-accent-soft" : ""}`}>
                  <span className="flex items-center gap-2">
                    <Mark cell={r.cells[c.id]} />
                    <span className={`footnote ${r.cells[c.id].ok ? "" : "text-muted"}`}>{r.cells[c.id].note}</span>
                  </span>
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td />
            {COLS.map((c) => (
              <td key={c.id} className={`px-3 pt-3 pb-5 ${c.popular ? "rounded-b-2xl bg-accent-soft" : ""}`}>
                {c.id === "airline" ? <span className="footnote text-muted">Included by law</span> : <SelectButton tier={c.id} featured={c.popular} />}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/** Phone layout: one card per plan, popular plan first, so nothing hides behind a sideways scroll. */
function CompareStack() {
  const order: ColId[] = ["trip_shield", "annual_pass", "airline"];
  return (
    <div className="space-y-3">
      {order.map((id) => {
        const c = COLS.find((x) => x.id === id)!;
        return (
          <div key={id} className={`card p-5 ${c.popular ? "shadow-[inset_0_0_0_2px_var(--accent),var(--shadow-card)]" : ""}`}>
            {c.popular && <span className="caption mb-2 inline-block rounded-full bg-accent px-2 py-0.5 font-semibold text-white">Most Popular</span>}
            <div className="headline">{c.name}</div>
            <div className="mt-1 flex items-baseline gap-1.5"><span className="title-1 tabular-nums">{c.price}</span><span className="footnote text-muted">{c.unit}</span></div>
            <ul className="mt-4 space-y-2.5">
              {ROWS.map((r) => (
                <li key={r.label} className="flex items-start gap-2.5">
                  <Mark cell={r.cells[id]} />
                  <span className="min-w-0">
                    <span className="footnote block font-medium">{r.label}</span>
                    <span className={`caption block ${r.cells[id].ok ? "text-ink/70" : "text-muted"}`}>{r.cells[id].note}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-5">{id === "airline" ? <p className="footnote text-muted">Included by law</p> : <SelectButton tier={id} featured={c.popular} />}</div>
          </div>
        );
      })}
    </div>
  );
}

/** Narrow version for sidebars: pick a plan, see what it adds over airline rules. */
function CompareCompact() {
  const saved = useProtection();
  const [view, setView] = useState<ProtectionTier>("trip_shield");
  const shown: ProtectionTier = saved ?? view;
  const col = COLS.find((c) => c.id === shown)!;
  return (
    <div>
      <div className="segmented flex! w-full" role="radiogroup" aria-label="Plan">
        {(["trip_shield", "annual_pass"] as ProtectionTier[]).map((t) => (
          <label key={t} data-on={shown === t} className="min-w-0! flex-1 px-2! text-[13px]!">
            <input type="radio" name="compact-plan" className="sr-only" checked={shown === t} onChange={() => { setView(t); if (saved) setProtection(t); }} />
            {PROTECTION_LABEL[t]}
          </label>
        ))}
      </div>
      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="title-1 tabular-nums">{col.price}</span>
        <span className="footnote text-muted">{col.unit}</span>
        {col.popular && <span className="caption ml-auto rounded-full bg-accent px-2 py-0.5 font-semibold text-white">Most Popular</span>}
      </div>
      <ul className="mt-4 space-y-3">
        {ROWS.map((r) => (
          <li key={r.label} className="flex items-start gap-2.5">
            <Mark cell={r.cells[shown]} />
            <span className="min-w-0">
              <span className="footnote block font-medium">{r.label}</span>
              <span className="caption block text-muted">{r.cells[shown].note} · airline alone: {r.cells.airline.note.toLowerCase()}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-5"><SelectButton tier={shown} featured /></div>
    </div>
  );
}

export function ComparePlans({ variant = "full" }: { variant?: "full" | "compact" }) {
  const current = useProtection();
  if (variant === "compact")
    return (
      <aside aria-labelledby="compare-compact-title" className="card p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-accent" aria-hidden />
          <h2 id="compare-compact-title" className="headline">Compare Protection Plans</h2>
        </div>
        <p className="footnote mt-1 text-muted">Cover the gaps airline rules leave.</p>
        <div className="mt-4"><CompareCompact /></div>
        <p className="caption mt-4 text-muted">{COMPLIANCE}</p>
      </aside>
    );

  return (
    <section aria-labelledby="compare-title">
      <div className="text-center">
        <h2 id="compare-title" className="title-1 scroll-rise">Compare Protection Plans</h2>
        <p className="mx-auto mt-3 max-w-lg text-muted">Airline rules leave gaps. Trip Shield and Annual Pass close them.</p>
      </div>
      <div className="card scroll-rise mt-10 hidden p-6 md:block">
        <CompareTable />
      </div>
      <div className="mt-8 md:hidden">
        <CompareStack />
      </div>
      {current && (
        <p role="status" className="footnote mt-4 text-center text-ok">
          <Check size={14} strokeWidth={3} className="mr-1 inline" aria-hidden />
          {PROTECTION_LABEL[current]} selected. It will be attached to your next claim.
        </p>
      )}
      <p className="caption mx-auto mt-4 max-w-2xl text-center text-muted">{COMPLIANCE}</p>
    </section>
  );
}

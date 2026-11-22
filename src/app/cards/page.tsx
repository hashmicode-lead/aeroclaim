"use client";

import { Check, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Lock, ShieldCheck, XCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DateTimeField } from "@/components/DateTimeField";
import { InsuranceAd } from "@/components/InsuranceAd";

type Brand = "visa" | "mastercard" | null;
type Kind = "credit" | "debit";
type Benefit = { id: string; label: string; trigger: string; inr: number };

const TIERS: Record<"visa" | "mastercard", string[]> = {
  visa: ["Classic", "Signature", "Infinite"],
  mastercard: ["Standard", "Platinum", "World", "World Elite"],
};

/** Sample benefit schedules for the demo. Real cover depends on the issuing bank's policy. */
const SCHEDULE: Record<string, Benefit[]> = {
  "visa:Signature": [
    { id: "delay", label: "Trip delay", trigger: "Flight delayed more than 6 hours", inr: 5000 },
    { id: "bagdelay", label: "Baggage delay", trigger: "Checked bag more than 12 hours late", inr: 7500 },
    { id: "baglost", label: "Lost baggage", trigger: "Bag declared lost by the airline", inr: 50000 },
  ],
  "visa:Infinite": [
    { id: "delay", label: "Trip delay", trigger: "Flight delayed more than 6 hours", inr: 15000 },
    { id: "bagdelay", label: "Baggage delay", trigger: "Checked bag more than 6 hours late", inr: 15000 },
    { id: "baglost", label: "Lost baggage", trigger: "Bag declared lost by the airline", inr: 100000 },
    { id: "missed", label: "Missed connection", trigger: "Onward flight missed because of a delay", inr: 10000 },
  ],
  "mastercard:Platinum": [
    { id: "bagdelay", label: "Baggage delay", trigger: "Checked bag more than 12 hours late", inr: 5000 },
    { id: "baglost", label: "Lost baggage", trigger: "Bag declared lost by the airline", inr: 25000 },
  ],
  "mastercard:World": [
    { id: "delay", label: "Trip delay", trigger: "Flight delayed more than 6 hours", inr: 10000 },
    { id: "bagdelay", label: "Baggage delay", trigger: "Checked bag more than 8 hours late", inr: 10000 },
    { id: "baglost", label: "Lost baggage", trigger: "Bag declared lost by the airline", inr: 75000 },
  ],
  "mastercard:World Elite": [
    { id: "delay", label: "Trip delay", trigger: "Flight delayed more than 4 hours", inr: 20000 },
    { id: "bagdelay", label: "Baggage delay", trigger: "Checked bag more than 6 hours late", inr: 20000 },
    { id: "baglost", label: "Lost baggage", trigger: "Bag declared lost by the airline", inr: 150000 },
    { id: "missed", label: "Missed connection", trigger: "Onward flight missed because of a delay", inr: 15000 },
  ],
};

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

function detect(num: string): Brand {
  const d = num.replace(/\D/g, "");
  if (/^4/.test(d)) return "visa";
  if (/^5[1-5]/.test(d) || /^2(2[2-9][1-9]|2[3-9]\d|[3-6]\d\d|7[01]\d|720)/.test(d)) return "mastercard";
  return null;
}

function luhn(num: string) {
  const d = num.replace(/\D/g, "");
  if (d.length < 13) return false;
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let n = Number(d[d.length - 1 - i]);
    if (i % 2) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}

function benefitsFor(brand: Brand, tier: string, kind: Kind): Benefit[] {
  if (!brand) return [];
  const list = SCHEDULE[`${brand}:${tier}`] ?? [];
  if (kind === "credit") return list;
  // Debit schedules: baggage cover only, at half the credit amount.
  return list.filter((b) => b.id.startsWith("bag")).map((b) => ({ ...b, inr: Math.round(b.inr / 2) }));
}

function CardFace({ brand, number, name, expiry, tier, kind }: { brand: Brand; number: string; name: string; expiry: string; tier: string; kind: Kind }) {
  const digits = number.replace(/\D/g, "");
  const last4 = digits.slice(-4).padStart(4, "•");
  const bg = brand === "mastercard" ? "from-[#2b2b2e] to-[#0b0b0c]" : brand === "visa" ? "from-[#1a3a8f] to-[#0b1f5c]" : "from-[#8e8e93] to-[#636366]";
  return (
    <div className={`relative aspect-[1.586] w-full max-w-sm overflow-hidden rounded-2xl bg-gradient-to-br ${bg} p-5 text-white shadow-[var(--shadow-raised)] transition-colors duration-500`}>
      <div className="absolute -top-16 -right-16 size-48 rounded-full bg-white/5" aria-hidden />
      <div className="flex items-start justify-between">
        <div className="h-7 w-10 rounded-md bg-gradient-to-br from-[#f5d98b] to-[#c9a44c]" aria-hidden />
        <span className="caption rounded-full bg-white/15 px-2 py-0.5 font-medium capitalize">{kind} · {tier || "Tier"}</span>
      </div>
      <div className="mt-8 font-mono text-[15px] tracking-[0.12em] whitespace-nowrap text-white/90">•••• •••• •••• {last4}</div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/50">Card holder</div>
          <div className="footnote truncate font-medium uppercase">{name || "Your name"}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/50">Expires</div>
          <div className="footnote font-medium">{expiry || "MM/YY"}</div>
        </div>
        <div className="h-8">
          {brand === "visa" && <span className="text-2xl font-extrabold italic tracking-tight">VISA</span>}
          {brand === "mastercard" && (
            <span className="flex" aria-label="Mastercard">
              <span className="size-8 rounded-full bg-[#eb001b]" />
              <span className="-ml-3.5 size-8 rounded-full bg-[#f79e1b]/90" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

const STEPS = ["Your card", "Booking check", "Cover", "File claim"];

export default function CardsPage() {
  const [step, setStep] = useState(0);
  const [kind, setKind] = useState<Kind>("credit");
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [tier, setTier] = useState("");
  const [err, setErr] = useState("");
  const [booking, setBooking] = useState({ pnr: "", airline: "", date: "", amount: "" });
  const [check, setCheck] = useState<"idle" | "checking" | "match" | "nomatch">("idle");
  const [incident, setIncident] = useState({ type: "delay", when: "", hours: "" });
  const [filed, setFiled] = useState<string | null>(null);

  const brand = detect(number);
  const tiers = brand ? TIERS[brand] : [];
  const benefits = benefitsFor(brand, tier, kind);
  const last4 = number.replace(/\D/g, "").slice(-4);
  const chosen = benefits.find((b) => b.id === incident.type);

  function next() {
    setErr("");
    if (step === 0) {
      if (!brand) return setErr("We support Visa and Mastercard. Check the card number.");
      if (!luhn(number)) return setErr("That card number doesn't look right. Check the digits.");
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) return setErr("Enter the expiry as MM/YY.");
      if (!tier) return setErr("Choose your card variant. It's printed on the card or in your bank app.");
    }
    if (step === 1 && check !== "match") return setErr("Check the booking first.");
    if (step === 2 && (!chosen || !incident.when)) return setErr("Choose what happened and when.");
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function runCheck() {
    if (!booking.pnr.trim() || !booking.date || !booking.amount) return setErr("Enter the PNR, booking date and amount paid.");
    setErr("");
    setCheck("checking");
    setTimeout(() => setCheck(/^\d+$/.test(booking.amount.replace(/,/g, "")) ? "match" : "nomatch"), 1200);
  }

  if (filed)
    return (
      <div className="reveal mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-ok-soft text-ok"><CheckCircle2 size={32} aria-hidden /></div>
        <h1 className="title-1 mt-5">Card claim filed</h1>
        <p className="mt-2 text-muted">Reference <strong className="text-ink">{filed}</strong>. We sent your boarding pass, the airline&apos;s delay letter and the card statement line to the {brand === "visa" ? "Visa" : "Mastercard"} benefits administrator.</p>
        <div className="card mt-8 p-5 text-left">
          {[["Filed", "Today", true], ["Insurer acknowledges", "Within 3 working days", false], ["Decision", "Within 15 days (IRDAI rule)", false], ["Payout to your card", "Within 7 days of approval", false]].map(([a, b, done]) => (
            <div key={a as string} className="flex items-center gap-3 border-b border-line py-3 last:border-0">
              <span className={`flex size-5 items-center justify-center rounded-full ${done ? "bg-ok text-white" : "bg-fill"}`}>{done ? <Check size={12} strokeWidth={3} aria-hidden /> : null}</span>
              <span className="footnote flex-1 font-medium">{a}</span>
              <span className="footnote text-muted">{b}</span>
            </div>
          ))}
        </div>
        <Link href="/dashboard" className="btn-primary mt-8">Go to my claims</Link>
      </div>
    );

  return (
    <div className="reveal mx-auto max-w-5xl px-4 py-10">
      <div className="px-1">
        <p className="eyebrow">Card cover</p>
        <h1 className="title-1 mt-2">Claim from your Visa or Mastercard</h1>
        <p className="mt-1.5 max-w-2xl text-muted">Many credit and debit cards insure flights bought with them. We check the booking was paid on your card, show what your card covers, and file the claim.</p>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="mb-5 px-1">
            <div className="flex items-baseline justify-between">
              <span className="footnote font-semibold">{STEPS[step]}</span>
              <span className="footnote text-muted">Step {step + 1} of {STEPS.length}</span>
            </div>
            <div className="mt-2.5 flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={4} aria-valuenow={step + 1} aria-label="Card claim progress">
              {STEPS.map((s, k) => <span key={s} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${k <= step ? "bg-accent" : "bg-fill"}`} />)}
            </div>
          </div>

          {step === 0 && (
            <section key="s0" className="card reveal grid gap-6 p-6 sm:p-7 md:grid-cols-[1fr_1fr]">
              <div className="space-y-4">
                <div className="segmented flex! w-full">
                  {(["credit", "debit"] as Kind[]).map((k) => (
                    <label key={k} data-on={kind === k} className="flex-1 capitalize">
                      <input type="radio" name="kind" className="sr-only" checked={kind === k} onChange={() => setKind(k)} />
                      {k} card
                    </label>
                  ))}
                </div>
                <div>
                  <label htmlFor="cardnum" className="label">Card number</label>
                  <input
                    id="cardnum"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    className="field font-mono tracking-wider"
                    placeholder="4000 1234 5678 9010"
                    value={number}
                    onChange={(e) => {
                      const d = e.target.value.replace(/\D/g, "").slice(0, 16);
                      setNumber(d.replace(/(.{4})/g, "$1 ").trim());
                      setTier("");
                    }}
                  />
                  <p className="hint">{brand ? `${brand === "visa" ? "Visa" : "Mastercard"} detected` : "Visa starts with 4, Mastercard with 5 or 2"}</p>
                </div>
                <div className="grid grid-cols-[1fr_110px] gap-3">
                  <div>
                    <label htmlFor="cname" className="label">Name on card</label>
                    <input id="cname" autoComplete="cc-name" className="field" placeholder="Ananya Sharma" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="exp" className="label">Expiry</label>
                    <input
                      id="exp"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      className="field"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => {
                        const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                        setExpiry(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
                      }}
                    />
                  </div>
                </div>
                {brand && (
                  <div className="reveal">
                    <span className="label">Card variant</span>
                    <div className="flex flex-wrap gap-2">
                      {tiers.map((t) => (
                        <button key={t} type="button" onClick={() => setTier(t)} className={`pressable rounded-full px-3.5 py-1.5 text-[14px] ${tier === t ? "bg-accent text-white" : "bg-fill hover:bg-surface-2"}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                )}
                <p className="caption flex items-center gap-1.5 text-muted"><Lock size={12} aria-hidden /> We keep only the last four digits. No CVV is ever asked for.</p>
              </div>
              <div className="flex items-start justify-center md:pt-12">
                <CardFace brand={brand} number={number} name={name} expiry={expiry} tier={tier} kind={kind} />
              </div>
            </section>
          )}

          {step === 1 && (
            <section key="s1" className="card reveal p-6 sm:p-7">
              <h2 className="title-2">Was the ticket paid with •••• {last4}?</h2>
              <p className="footnote mt-1 text-muted">Card insurance applies only when the full fare was charged to the card. Enter the booking and we&apos;ll match it against your statement.</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="pnr" className="label">PNR</label>
                  <input id="pnr" className="field uppercase" placeholder="K4TQ7M" value={booking.pnr} onChange={(e) => setBooking({ ...booking, pnr: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="air" className="label">Airline</label>
                  <input id="air" className="field" placeholder="Air India" value={booking.airline} onChange={(e) => setBooking({ ...booking, airline: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="bdate" className="label">Booking date</label>
                  <DateTimeField id="bdate" value={booking.date} onChange={(v) => setBooking({ ...booking, date: v })} />
                </div>
                <div>
                  <label htmlFor="amt" className="label">Amount charged (₹)</label>
                  <input id="amt" inputMode="numeric" className="field" placeholder="38,450" value={booking.amount} onChange={(e) => setBooking({ ...booking, amount: e.target.value })} />
                </div>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button type="button" className="btn-ghost" onClick={runCheck} disabled={check === "checking"}>
                  {check === "checking" ? <><Loader2 size={15} className="animate-spin" aria-hidden /> Matching with your statement…</> : "Check booking"}
                </button>
              </div>
              {check === "match" && (
                <div className="reveal mt-5 flex items-start gap-3 rounded-2xl bg-ok-soft p-4">
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-ok" aria-hidden />
                  <div className="footnote">
                    <strong>Match found.</strong> {inr(Number(booking.amount.replace(/,/g, "")))} to {booking.airline || "the airline"} on •••• {last4}, PNR {booking.pnr.toUpperCase()}. This booking qualifies for card cover.
                  </div>
                </div>
              )}
              {check === "nomatch" && (
                <div className="reveal mt-5 flex items-start gap-3 rounded-2xl bg-bad-soft p-4">
                  <XCircle size={20} className="mt-0.5 shrink-0 text-bad" aria-hidden />
                  <p className="footnote">We couldn&apos;t match that amount. Enter it in rupees, digits only.</p>
                </div>
              )}
            </section>
          )}

          {step === 2 && (
            <section key="s2" className="card reveal p-6 sm:p-7">
              <h2 className="title-2">Your {brand === "visa" ? "Visa" : "Mastercard"} {tier} {kind} cover</h2>
              {benefits.length === 0 ? (
                <p className="footnote mt-3 rounded-2xl bg-warn-soft p-4">This card variant doesn&apos;t include travel insurance. You can still claim from the airline, and a standalone travel policy would cover future trips.</p>
              ) : (
                <>
                  <ul className="mt-4 divide-y divide-line">
                    {benefits.map((b) => (
                      <li key={b.id}>
                        <label className={`flex cursor-pointer items-center gap-4 rounded-xl px-2 py-3.5 ${incident.type === b.id ? "bg-accent-soft" : "hover:bg-surface-2"}`}>
                          <input type="radio" name="benefit" className="size-4 accent-[var(--accent)]" checked={incident.type === b.id} onChange={() => setIncident({ ...incident, type: b.id })} />
                          <span className="min-w-0 flex-1">
                            <span className="headline block">{b.label}</span>
                            <span className="footnote text-muted">{b.trigger}</span>
                          </span>
                          <span className="headline tabular-nums">up to {inr(b.inr)}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="when" className="label">When did it happen?</label>
                      <DateTimeField id="when" withTime value={incident.when} onChange={(v) => setIncident({ ...incident, when: v })} placeholder="Select date and time" />
                    </div>
                    <div>
                      <label htmlFor="hours" className="label">How many hours late?</label>
                      <input id="hours" inputMode="numeric" className="field" placeholder="6" value={incident.hours} onChange={(e) => setIncident({ ...incident, hours: e.target.value.replace(/\D/g, "") })} />
                    </div>
                  </div>
                </>
              )}
            </section>
          )}

          {step === 3 && chosen && (
            <section key="s3" className="card reveal p-6 sm:p-7">
              <h2 className="title-2">Review and file</h2>
              <dl className="footnote mt-4 divide-y divide-line">
                {[
                  ["Card", `${brand === "visa" ? "Visa" : "Mastercard"} ${tier} ${kind} •••• ${last4}`],
                  ["Booking", `${booking.airline || "Airline"} · PNR ${booking.pnr.toUpperCase()} · ${inr(Number(booking.amount.replace(/,/g, "")))}`],
                  ["Benefit", chosen.label],
                  ["Incident", `${incident.when.replace("T", ", ")}${incident.hours ? ` · ${incident.hours} h late` : ""}`],
                  ["Attachments", "Boarding pass, airline delay letter, statement line"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6 py-3"><dt className="text-muted">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
                ))}
              </dl>
              <div className="mt-5 flex items-center justify-between rounded-2xl bg-fill p-4">
                <span className="footnote">Claiming</span>
                <span className="title-1 tabular-nums">{inr(chosen.inr)}</span>
              </div>
            </section>
          )}

          {err && <p className="footnote mt-4 text-bad" role="alert">{err}</p>}

          <div className="mt-6 flex items-center justify-between gap-3">
            {step > 0 ? (
              <button type="button" className="btn-ghost px-5! py-2.5!" onClick={() => { setErr(""); setStep((s) => s - 1); }}><ChevronLeft size={16} aria-hidden /> Back</button>
            ) : <span />}
            {step < 3 ? (
              <button type="button" className="btn-primary px-6! py-2.5!" onClick={next} disabled={step === 2 && benefits.length === 0}>Continue <ChevronRight size={16} aria-hidden /></button>
            ) : (
              <button type="button" className="btn-primary px-6! py-2.5!" onClick={() => setFiled(`CC-${Math.floor(100000 + Math.random() * 899999)}`)}>
                <ShieldCheck size={16} aria-hidden /> File card claim
              </button>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <p className="headline">How card cover works</p>
            <ol className="footnote mt-3 list-decimal space-y-2 pl-4 text-muted">
              <li>The ticket must be paid in full on the card.</li>
              <li>Cover starts after the delay threshold for your card.</li>
              <li>Claim within 30 days with the airline&apos;s delay letter or PIR.</li>
              <li>The airline claim and the card claim can both pay out.</li>
            </ol>
          </div>
          <InsuranceAd index={1} />
        </aside>
      </div>
    </div>
  );
}

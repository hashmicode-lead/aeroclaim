"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AIRLINES, AIRPORTS } from "@/lib/airports";
import { DOC_KIND_LABELS, type DisruptionType, type DocKind } from "@/lib/types";

type Values = Record<string, string>;
type ParseResponse = {
  fields: Record<string, string | number | boolean>;
  results: { filename: string; kind: DocKind; source: string; found: string[]; missing: string[] }[];
  unreadable: string[];
};

const TYPES: { id: DisruptionType; title: string; desc: string }[] = [
  { id: "delay", title: "Delayed flight", desc: "Departed late, missed a connection" },
  { id: "cancellation", title: "Cancelled flight", desc: "Cancelled or heavily rescheduled" },
  { id: "denied_boarding", title: "Denied boarding", desc: "Overbooked, offloaded at the gate" },
  { id: "baggage", title: "Baggage problem", desc: "Delayed, damaged, pilfered or lost" },
  { id: "refund", title: "Stuck refund", desc: "Cancelled ticket, money not returned" },
];

const REASONS: [string, string][] = [
  ["unknown", "Not stated / don't know"],
  ["weather", "Weather (fog, storm…)"],
  ["technical", "Technical / aircraft issue"],
  ["operational", "Operational reasons"],
  ["crew", "Crew unavailability"],
  ["atc", "Air traffic control"],
  ["security", "Security"],
  ["strike", "Strike"],
  ["other", "Other"],
];

const india = AIRPORTS.filter((a) => a.country === "IN");
const intl = AIRPORTS.filter((a) => a.country !== "IN");

function AirportSelect({ name, value, onChange }: { name: string; value: string; onChange: (v: string) => void }) {
  return (
    <select id={name} className="field" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select airport</option>
      <optgroup label="India">
        {india.map((a) => (
          <option key={a.iata} value={a.iata}>{a.iata}, {a.city}</option>
        ))}
      </optgroup>
      <optgroup label="International">
        {intl.map((a) => (
          <option key={a.iata} value={a.iata}>{a.iata}, {a.city}</option>
        ))}
      </optgroup>
    </select>
  );
}

function YesNo({ name, value, onChange, label }: { name: string; value: string; onChange: (v: string) => void; label: string }) {
  return (
    <fieldset>
      <legend className="label">{label}</legend>
      <div className="flex gap-2">
        {[["true", "Yes"], ["false", "No"]].map(([v, l]) => (
          <label key={v} className={`cursor-pointer rounded-lg border px-4 py-1.5 text-sm ${value === v ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface"}`}>
            <input type="radio" name={name} value={v} checked={value === v} onChange={() => onChange(v)} className="sr-only" />
            {l}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function ClaimForm() {
  const router = useRouter();
  const [v, setV] = useState<Values>({ airlineReason: "unknown", bookingChannel: "airline", paymentMethod: "credit_card" });
  const [files, setFiles] = useState<{ file: File; kind: DocKind | "auto" }[]>([]);
  const [paste, setPaste] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParseResponse | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const set = (k: string) => (val: string) => setV((s) => ({ ...s, [k]: val }));
  const bind = (k: string) => ({ id: k, name: k, value: v[k] ?? "", onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => set(k)(e.target.value) });
  const err = (k: string) => (errors[k] ? <p className="mt-1 text-xs text-bad">{errors[k]}</p> : null);
  const type = v.disruptionType as DisruptionType | undefined;

  async function autofill() {
    setParsing(true);
    const fd = new FormData();
    fd.set("text", paste);
    files.forEach((f) => fd.append("files", f.file));
    try {
      const res = await fetch("/api/parse", { method: "POST", body: fd });
      const data = (await res.json()) as ParseResponse;
      setParsed(data);
      setV((s) => {
        const next = { ...s };
        for (const [k, val] of Object.entries(data.fields)) if (!next[k]) next[k] = String(val);
        return next;
      });
      setFiles((fs) => fs.map((f) => ({ ...f, kind: f.kind === "auto" ? (data.results.find((r) => r.filename === f.file.name)?.kind ?? "auto") : f.kind })));
    } finally {
      setParsing(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    const fd = new FormData();
    fd.set("data", JSON.stringify(v));
    files.forEach((f) => {
      fd.append("files", f.file);
      fd.append("kinds", f.kind);
    });
    const res = await fetch("/api/claims", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) {
      setErrors(data.errors ?? { form: "Something went wrong" });
      setSubmitting(false);
      document.getElementById(Object.keys(data.errors ?? {})[0])?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    router.push(`/claims/${data.id}`);
  }

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      {/* 1. Auto-fill */}
      <section className="card p-5">
        <h2 className="text-base font-semibold">1. Upload your documents</h2>
        <p className="mt-1 text-sm text-muted">
          Add your e-ticket, boarding pass, PIR, airline SMS/email and receipts. We read text-based PDFs and pasted text to pre-fill the form, and keep every file as evidence for your claim packet.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="files" className="label">Documents</label>
            <input
              id="files"
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.webp,.heic,.txt"
              className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-surface-2 file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink hover:file:bg-line"
              onChange={(e) => {
                const list = Array.from(e.target.files ?? []);
                setFiles((fs) => [...fs, ...list.map((file) => ({ file, kind: "auto" as const }))].slice(0, 12));
                e.target.value = "";
              }}
            />
            <p className="hint">PDF, image or text, up to 10 MB each and 12 files in total.</p>
          </div>
          <div>
            <label htmlFor="paste" className="label">Or paste an airline SMS / email / boarding-pass barcode text</label>
            <textarea id="paste" rows={3} className="field font-mono text-xs" value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="Dear Customer, your flight 6E 2134 DEL-BOM on 14 Dec 2026 at 06:10 has been cancelled… PNR: X7K2QP" />
          </div>
        </div>
        {files.length > 0 && (
          <ul className="mt-4 divide-y divide-line rounded-lg border border-line">
            {files.map((f, idx) => (
              <li key={idx} className="flex flex-wrap items-center gap-3 px-3 py-2 text-sm">
                <span className="min-w-0 flex-1 truncate">{f.file.name}</span>
                <select
                  aria-label={`Document type for ${f.file.name}`}
                  className="field w-auto! py-1! text-xs"
                  value={f.kind}
                  onChange={(e) => setFiles((fs) => fs.map((x, i) => (i === idx ? { ...x, kind: e.target.value as DocKind | "auto" } : x)))}
                >
                  <option value="auto">Detect automatically</option>
                  {Object.entries(DOC_KIND_LABELS).map(([k, l]) => (
                    <option key={k} value={k}>{l}</option>
                  ))}
                </select>
                <button type="button" className="text-xs text-muted hover:text-bad" onClick={() => setFiles((fs) => fs.filter((_, i) => i !== idx))}>Remove</button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" className="btn-ghost" disabled={parsing || (!paste.trim() && !files.length)} onClick={autofill}>
            {parsing ? "Reading…" : "Extract details"}
          </button>
          {parsed && (
            <p className="text-sm text-muted">
              {parsed.results.length
                ? `Found: ${[...new Set(parsed.results.flatMap((r) => r.found))].join(", ") || "nothing recognisable"}.`
                : "No readable text found."}{" "}
              {parsed.unreadable.length > 0 && <span>Could not read: {parsed.unreadable.join("; ")}.</span>} Check the fields below.
            </p>
          )}
        </div>
      </section>

      {/* 2. What happened */}
      <section className="card p-5">
        <h2 className="mb-4 text-base font-semibold" id="disruptionType">2. What happened?</h2>
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {TYPES.map((t) => (
            <label key={t.id} className={`cursor-pointer rounded-lg border p-3 transition-colors ${type === t.id ? "border-accent bg-accent-soft" : "border-line hover:bg-surface-2"}`}>
              <input type="radio" name="disruptionType" value={t.id} checked={type === t.id} onChange={() => set("disruptionType")(t.id)} className="sr-only" />
              <span className={`block text-sm font-medium ${type === t.id ? "text-accent" : ""}`}>{t.title}</span>
              <span className="mt-0.5 block text-xs text-muted">{t.desc}</span>
            </label>
          ))}
        </div>
        {err("disruptionType")}
      </section>

      {/* 3. Flight */}
      <section className="card p-5">
        <h2 className="mb-4 text-base font-semibold">3. Flight details</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="pnr" className="label">PNR / booking reference</label>
            <input className="field uppercase" {...bind("pnr")} maxLength={8} placeholder="X7K2QP" />
            {err("pnr")}
          </div>
          <div>
            <label htmlFor="airline" className="label">Airline</label>
            <input className="field" list="airlines" {...bind("airline")} placeholder="IndiGo" />
            <datalist id="airlines">{[...new Set(Object.values(AIRLINES))].map((a) => <option key={a} value={a} />)}</datalist>
            {err("airline")}
          </div>
          <div>
            <label htmlFor="flightNumber" className="label">Flight number</label>
            <input className="field uppercase" {...bind("flightNumber")} placeholder="6E2134" />
            {err("flightNumber")}
          </div>
          <div>
            <label htmlFor="origin" className="label">From</label>
            <AirportSelect name="origin" value={v.origin ?? ""} onChange={set("origin")} />
            {err("origin")}
          </div>
          <div>
            <label htmlFor="destination" className="label">To</label>
            <AirportSelect name="destination" value={v.destination ?? ""} onChange={set("destination")} />
            {err("destination")}
          </div>
          <div>
            <label htmlFor="airlineReason" className="label">Reason the airline gave</label>
            <select className="field" {...bind("airlineReason")}>
              {REASONS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="scheduledDeparture" className="label">Scheduled departure</label>
            <input type="datetime-local" className="field" {...bind("scheduledDeparture")} />
            <p className="hint">Local time at origin</p>
            {err("scheduledDeparture")}
          </div>
          <div>
            <label htmlFor="scheduledArrival" className="label">Scheduled arrival</label>
            <input type="datetime-local" className="field" {...bind("scheduledArrival")} />
            <p className="hint">Local time at destination. Used to work out block time.</p>
            {err("scheduledArrival")}
          </div>
          {type === "delay" && (
            <div>
              <label htmlFor="actualDeparture" className="label">Actual departure</label>
              <input type="datetime-local" className="field" {...bind("actualDeparture")} />
              {err("actualDeparture")}
            </div>
          )}
        </div>
      </section>

      {/* 4. Type-specific */}
      {type && (
        <section className="card p-5">
          <h2 className="mb-4 text-base font-semibold">4. About the {TYPES.find((t) => t.id === type)?.title.toLowerCase()}</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {type === "delay" && (
              <>
                <YesNo name="mealsProvided" label="Did the airline provide meals/refreshments?" value={v.mealsProvided ?? ""} onChange={set("mealsProvided")} />
                <YesNo name="hotelProvided" label="Did the airline provide a hotel (if overnight)?" value={v.hotelProvided ?? ""} onChange={set("hotelProvided")} />
              </>
            )}
            {type === "cancellation" && (
              <div>
                <label htmlFor="cancellationNoticeHours" className="label">How many hours before departure were you told?</label>
                <input type="number" min={0} className="field" {...bind("cancellationNoticeHours")} placeholder="e.g. 3" />
                <p className="hint">Use the time of the first SMS or email. 2 weeks = 336 hours.</p>
                {err("cancellationNoticeHours")}
              </div>
            )}
            {type === "denied_boarding" && <YesNo name="deniedVoluntary" label="Did you volunteer to give up your seat?" value={v.deniedVoluntary ?? ""} onChange={set("deniedVoluntary")} />}
            {(type === "cancellation" || type === "denied_boarding") && (
              <>
                <YesNo name="alternateOffered" label="Was an alternate flight offered?" value={v.alternateOffered ?? ""} onChange={set("alternateOffered")} />
                {v.alternateOffered === "true" && (
                  <div>
                    <label htmlFor="alternateDeparture" className="label">Alternate flight departure</label>
                    <input type="datetime-local" className="field" {...bind("alternateDeparture")} />
                  </div>
                )}
              </>
            )}
            {(type === "delay" || type === "cancellation" || type === "denied_boarding") && (
              <>
                <YesNo name="missedConnection" label="Did you miss a connecting flight?" value={v.missedConnection ?? ""} onChange={set("missedConnection")} />
                {v.missedConnection === "true" && <YesNo name="singlePnr" label="Were both flights on the same PNR?" value={v.singlePnr ?? ""} onChange={set("singlePnr")} />}
              </>
            )}
            {type === "baggage" && (
              <>
                <div>
                  <label htmlFor="baggageIssue" className="label">What happened to the bag?</label>
                  <select className="field" {...bind("baggageIssue")}>
                    <option value="">Select</option>
                    <option value="delayed">Delayed (arrived late or still missing)</option>
                    <option value="damaged">Damaged</option>
                    <option value="pilfered">Items missing from the bag</option>
                    <option value="lost">Lost (21+ days, or airline confirmed)</option>
                  </select>
                </div>
                {v.baggageIssue !== "lost" && (
                  <div>
                    <label htmlFor="baggageReceivedOn" className="label">Date you received the bag</label>
                    <input type="date" className="field" {...bind("baggageReceivedOn")} />
                    <p className="hint">Leave empty if it has not arrived yet.</p>
                  </div>
                )}
                <YesNo name="pirFiled" label="Did you file a PIR at the airport?" value={v.pirFiled ?? ""} onChange={set("pirFiled")} />
                {v.pirFiled === "true" && (
                  <div>
                    <label htmlFor="pirNumber" className="label">PIR / file reference</label>
                    <input className="field uppercase" {...bind("pirNumber")} placeholder="DELAI12345" />
                  </div>
                )}
                <div>
                  <label htmlFor="baggageClaimAmount" className="label">Amount you are claiming (₹)</label>
                  <input type="number" min={0} className="field" {...bind("baggageClaimAmount")} placeholder="Value of items, repair or interim purchases" />
                  {err("baggageClaimAmount")}
                </div>
              </>
            )}
            {(type === "refund" || type === "cancellation") && (
              <>
                <div>
                  <label htmlFor="refundRequestedOn" className="label">Date you cancelled / requested refund</label>
                  <input type="date" className="field" {...bind("refundRequestedOn")} />
                  {type === "cancellation" && <p className="hint">Leave empty if you took the alternate flight.</p>}
                </div>
                {v.refundRequestedOn && (
                  <>
                    <YesNo name="refundReceived" label="Have you received the full refund?" value={v.refundReceived ?? ""} onChange={set("refundReceived")} />
                    <div>
                      <label htmlFor="refundAmountPending" className="label">Refund amount pending (₹)</label>
                      <input type="number" min={0} className="field" {...bind("refundAmountPending")} />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* 5. Fare */}
      <section className="card p-5">
        <h2 className="mb-4 text-base font-semibold">{type ? "5" : "4"}. Fare & payment</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="basicFarePlusFuel" className="label">Basic fare + fuel charge (₹)</label>
            <input type="number" min={0} className="field" {...bind("basicFarePlusFuel")} />
            <p className="hint">From the fare breakup, for this one-way sector. DGCA caps compensation at this amount.</p>
            {err("basicFarePlusFuel")}
          </div>
          <div>
            <label htmlFor="totalFare" className="label">Total paid (₹)</label>
            <input type="number" min={0} className="field" {...bind("totalFare")} />
            {err("totalFare")}
          </div>
          <div>
            <label htmlFor="bookingDate" className="label">Booking date</label>
            <input type="date" className="field" {...bind("bookingDate")} />
          </div>
          <div>
            <label htmlFor="bookingChannel" className="label">Booked through</label>
            <select className="field" {...bind("bookingChannel")}>
              <option value="airline">Airline website / app / office</option>
              <option value="agent">Travel agent / portal (MakeMyTrip, etc.)</option>
            </select>
          </div>
          <div>
            <label htmlFor="paymentMethod" className="label">Paid by</label>
            <select className="field" {...bind("paymentMethod")}>
              <option value="credit_card">Credit card</option>
              <option value="debit_card">Debit card</option>
              <option value="upi">UPI</option>
              <option value="netbanking">Net banking</option>
              <option value="wallet">Wallet</option>
              <option value="cash">Cash</option>
            </select>
          </div>
        </div>
      </section>

      {/* 6. You */}
      <section className="card p-5">
        <h2 className="mb-4 text-base font-semibold">{type ? "6" : "5"}. Your details</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="passengerName" className="label">Passenger name</label>
            <input className="field" {...bind("passengerName")} autoComplete="name" />
            {err("passengerName")}
          </div>
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input type="email" className="field" {...bind("email")} autoComplete="email" />
            {err("email")}
          </div>
          <div>
            <label htmlFor="phone" className="label">Phone</label>
            <input type="tel" className="field" {...bind("phone")} autoComplete="tel" />
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="notes" className="label">Anything else? (optional)</label>
            <textarea rows={3} className="field" {...bind("notes")} placeholder="What the staff told you, what you spent, how you were treated…" />
          </div>
        </div>
      </section>

      {(errors.form || errors.files) && <p className="text-sm text-bad">{errors.form ?? errors.files}</p>}
      {Object.keys(errors).length > 0 && !errors.form && !errors.files && <p className="text-sm text-bad">Please fix the highlighted fields.</p>}
      <div className="flex justify-end">
        <button type="submit" className="btn-primary px-6! py-2.5!" disabled={submitting}>
          {submitting ? "Assessing your claim…" : "Assess my claim"}
        </button>
      </div>
    </form>
  );
}

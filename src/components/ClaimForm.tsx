"use client";

import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, FileText, UploadCloud, X } from "lucide-react";
import { useState } from "react";
import { AIRLINES, AIRPORTS } from "@/lib/airports";
import { DateTimeField } from "./DateTimeField";
import { currentProtection } from "./session";
import { DOC_KIND_LABELS, type DisruptionType, type DocKind } from "@/lib/types";

type Values = Record<string, string>;
type Upload = { key: string; file: File; kind: DocKind | "auto"; status: "local" | "uploading" | "done" | "error"; pathname?: string };
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

const SAMPLES = {
  ticket: `AIR INDIA E-TICKET ITINERARY RECEIPT
Passenger: Ananya Sharma
Booking Reference (PNR): K4TQ7M
Issue Date / Booking Date: 05 Nov 2026
Flight: AI 161 (Air India)
Route: DEL to LHR on 19 Nov 2026 at 02:15
Disruption: Delayed 6h 20m due to operational reasons

FARE BREAKDOWN:
Basic Fare: ₹38,500
Airline Fuel Charge (YQ): ₹12,000
Basic Fare + Fuel Charge: ₹50,500
User Development Fee (UDF): ₹1,850
Passenger Service Fee (PSF): ₹420
GST: ₹2,530
Total Fare Paid: ₹55,300

Payment Method: Credit Card (Visa Platinum ···· 4821)
Booking Channel: Airline Direct`,
  sms: `Dear Customer, your IndiGo flight 6E 2134 DEL-BOM on 14 Dec 2026 at 06:10 has been cancelled due to operational reasons. You may choose a full refund or free reschedule. PNR: X7K2QP`,
  pir: `Property Irregularity Report (PIR)
File Reference: DELAI48213
Passenger: Ananya Sharma
Flight: AI 161 DEL to LHR on 19 Nov 2026
Issue: Damaged suitcase shell and delayed arrival
PIR Filed: Yes at London Heathrow baggage desk`,
};

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
      <div className="segmented">
        {[["true", "Yes"], ["false", "No"]].map(([v, l]) => (
          <label key={v} data-on={value === v}>
            <input type="radio" name={name} value={v} checked={value === v} onChange={() => onChange(v)} className="sr-only" />
            {l}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const STEP_DEFS = [
  { id: "docs", label: "Documents" },
  { id: "what", label: "What happened" },
  { id: "flight", label: "Flight" },
  { id: "details", label: "Details" },
  { id: "fare", label: "Fare" },
  { id: "you", label: "Your details" },
] as const;
type StepId = (typeof STEP_DEFS)[number]["id"];

const FIELD_STEP: Record<string, StepId> = {
  files: "docs",
  disruptionType: "what",
  pnr: "flight", airline: "flight", flightNumber: "flight", origin: "flight", destination: "flight",
  scheduledDeparture: "flight", scheduledArrival: "flight", actualDeparture: "flight", airlineReason: "flight",
  basicFarePlusFuel: "fare", totalFare: "fare", bookingDate: "fare", bookingChannel: "fare", paymentMethod: "fare",
  passengerName: "you", email: "you", phone: "you", notes: "you",
};

function validateStep(id: StepId, v: Values): Record<string, string> {
  const e: Record<string, string> = {};
  if (id === "what" && !v.disruptionType) e.disruptionType = "Choose what happened";
  if (id === "flight") {
    if (!v.pnr?.trim()) e.pnr = "Enter your PNR";
    if (!v.airline?.trim()) e.airline = "Enter the airline";
    if (!v.flightNumber?.trim()) e.flightNumber = "Enter the flight number";
    if (!v.origin) e.origin = "Choose an airport";
    if (!v.destination) e.destination = "Choose an airport";
    else if (v.destination === v.origin) e.destination = "Must differ from origin";
    if (!v.scheduledDeparture) e.scheduledDeparture = "Enter the scheduled departure";
  }
  if (id === "you") {
    if (!v.passengerName?.trim()) e.passengerName = "Enter the passenger's name";
    if (v.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email)) e.email = "Check the email address";
  }
  return e;
}

export function ClaimForm({ directUpload = false }: { directUpload?: boolean }) {
  const router = useRouter();
  const [v, setV] = useState<Values>({ airlineReason: "unknown", bookingChannel: "airline", paymentMethod: "credit_card" });
  const [files, setFiles] = useState<Upload[]>([]);
  const [paste, setPaste] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParseResponse | null>(null);
  const [autofilled, setAutofilled] = useState<Record<string, boolean>>({});
  const [sampleBadge, setSampleBadge] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [drag, setDrag] = useState(false);

  const set = (k: string) => (val: string) => setV((s) => ({ ...s, [k]: val }));
  const bind = (k: string) => ({ id: k, name: k, value: v[k] ?? "", onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => set(k)(e.target.value) });
  const err = (k: string) => (errors[k] ? <p className="mt-1 text-xs text-bad">{errors[k]}</p> : null);
  const type = v.disruptionType as DisruptionType | undefined;

  const uploading = files.some((f) => f.status === "uploading");
  const steps = STEP_DEFS.filter((d) => d.id !== "details" || type);
  const i = Math.min(stepIdx, steps.length - 1);
  const step = steps[i].id;
  const last = i === steps.length - 1;

  function go(to: number) {
    setStepIdx(to);
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  function next() {
    const e = validateStep(step, v);
    setErrors(e);
    if (Object.keys(e).length) {
      document.getElementById(Object.keys(e)[0])?.focus();
      return;
    }
    go(i + 1);
  }

  /** Attach files to a request: direct-to-Blob references in production, inline multipart locally. */
  function appendFiles(fd: FormData, withKinds: boolean) {
    const refs: { pathname: string; filename: string; mime: string; kind: string }[] = [];
    for (const f of files) {
      if (f.status === "done" && f.pathname) refs.push({ pathname: f.pathname, filename: f.file.name, mime: f.file.type, kind: f.kind });
      else if (f.status === "local") {
        fd.append("files", f.file);
        if (withKinds) fd.append("kinds", f.kind);
      }
    }
    fd.set("blobs", JSON.stringify(refs));
  }

  function addFiles(list: File[]) {
    const added: Upload[] = list.map((file) => ({ key: crypto.randomUUID(), file, kind: "auto", status: directUpload ? "uploading" : "local" }));
    setFiles((fs) => [...fs, ...added].slice(0, 12));
    if (!directUpload) return;
    for (const u of added) {
      const safe = u.file.name.replace(/[^\w.-]+/g, "_").slice(-80);
      upload(`uploads/${safe}`, u.file, { access: "private", handleUploadUrl: "/api/uploads", contentType: u.file.type || undefined })
        .then((res) => setFiles((fs) => fs.map((x) => (x.key === u.key ? { ...x, status: "done", pathname: res.pathname } : x))))
        .catch(() => setFiles((fs) => fs.map((x) => (x.key === u.key ? { ...x, status: "error" } : x))));
    }
  }

  async function autofill(customText?: string) {
    setParsing(true);
    const fd = new FormData();
    const textToParse = customText ?? paste;
    fd.set("text", textToParse);
    appendFiles(fd, false);
    try {
      const res = await fetch("/api/parse", { method: "POST", body: fd });
      const data = (await res.json()) as ParseResponse;
      setParsed(data);
      const filledMap: Record<string, boolean> = {};
      setV((s) => {
        const next = { ...s };
        for (const [k, val] of Object.entries(data.fields)) {
          if (!next[k] || next[k] === "unknown" || next[k] === "") {
            next[k] = String(val);
            filledMap[k] = true;
          } else if (data.fields[k] !== undefined) {
            filledMap[k] = true;
          }
        }
        return next;
      });
      setAutofilled((prev) => ({ ...prev, ...filledMap }));
      setFiles((fs) => fs.map((f) => ({ ...f, kind: f.kind === "auto" ? (data.results.find((r) => r.filename === f.file.name)?.kind ?? "auto") : f.kind })));
    } finally {
      setParsing(false);
    }
  }

  function loadSample(key: keyof typeof SAMPLES, name: string) {
    const text = SAMPLES[key];
    setPaste(text);
    setSampleBadge(name);
    autofill(text);
    setTimeout(() => setSampleBadge(null), 4000);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!last) return next();
    const local = validateStep(step, v);
    if (Object.keys(local).length) return setErrors(local);
    setSubmitting(true);
    setErrors({});
    const fd = new FormData();
    fd.set("data", JSON.stringify({ ...v, protectionTier: currentProtection() ?? undefined }));
    if (paste.trim()) fd.set("text", paste.trim());
    appendFiles(fd, true);
    const res = await fetch("/api/claims", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) {
      setErrors(data.errors ?? { form: "Something went wrong" });
      setSubmitting(false);
      const first = Object.keys(data.errors ?? {})[0];
      const target = steps.findIndex((st) => st.id === (FIELD_STEP[first] ?? "details"));
      if (target >= 0 && target !== i) go(target);
      return;
    }
    router.push(`/claims/${data.id}`);
  }

  return (
    <form onSubmit={submit} noValidate>
      {/* Progress */}
      <div className="mb-5 px-1">
        <div className="flex items-baseline justify-between">
          <span className="footnote font-semibold">{steps[i].label}</span>
          <span className="footnote text-muted">Step {i + 1} of {steps.length}</span>
        </div>
        <div className="mt-2.5 flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={i + 1} aria-label="Claim progress">
          {steps.map((st, k) => (
            <button
              key={st.id}
              type="button"
              aria-label={`Go to ${st.label}`}
              disabled={k > i}
              onClick={() => go(k)}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 disabled:cursor-default ${k <= i ? "bg-accent" : "bg-fill"}`}
            />
          ))}
        </div>
      </div>

      {step === "docs" && (
      <section key="docs" className="card reveal p-6 sm:p-7">
        <h2 className="title-2">Upload your documents</h2>
        <p className="mt-1 text-sm text-muted">
          Add your e-ticket, boarding pass, PIR, airline SMS/email and receipts. We read text-based PDFs and pasted text to pre-fill the form, and preserve them as official evidence. You can also upload any missing files directly from your claim assessment page.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <span className="label">Documents</span>
            <label
              htmlFor="files"
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(Array.from(e.dataTransfer.files)); }}
              className={`pressable flex min-h-[150px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed px-6 py-6 text-center has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-accent-soft ${drag ? "border-accent bg-accent-soft" : "border-line bg-fill hover:bg-surface-2"}`}
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-surface text-accent shadow-[var(--shadow-card)]">
                <UploadCloud size={22} aria-hidden />
              </span>
              <span className="headline mt-1">Drop files here</span>
              <span className="footnote text-muted">or <span className="font-medium text-accent">browse</span> · PDF, image or text, 10 MB each</span>
              <input
                id="files"
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.webp,.heic,.txt"
                className="sr-only"
                onChange={(e) => {
                  addFiles(Array.from(e.target.files ?? []));
                  e.target.value = "";
                }}
              />
            </label>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="caption font-medium text-muted">Try sample:</span>
              <button
                type="button"
                onClick={() => loadSample("ticket", "E-Ticket")}
                className="caption pressable inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent-soft px-2.5 py-1 text-accent hover:bg-accent/15"
              >
                🎟️ E-ticket (fare &amp; PNR)
              </button>
              <button
                type="button"
                onClick={() => loadSample("sms", "Cancellation SMS")}
                className="caption pressable inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1 text-ink/80 hover:bg-surface-2"
              >
                📱 Cancellation SMS
              </button>
              <button
                type="button"
                onClick={() => loadSample("pir", "Baggage PIR")}
                className="caption pressable inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1 text-ink/80 hover:bg-surface-2"
              >
                🧳 Baggage PIR
              </button>
              {sampleBadge && (
                <span className="caption inline-flex items-center gap-1 rounded-full bg-ok-soft px-2 py-0.5 font-medium text-ok">
                  ✓ {sampleBadge} loaded &amp; parsed
                </span>
              )}
            </div>
            <p className="caption mt-2 text-muted">
              Download test files:{" "}
              <a href="/samples/e-ticket-sample.txt" download className="text-accent hover:underline">e-ticket</a>,{" "}
              <a href="/samples/boarding-pass-sample.pdf" download className="text-accent hover:underline">boarding pass</a>,{" "}
              <a href="/samples/airline-sms-sample.txt" download className="text-accent hover:underline">airline SMS</a> or{" "}
              <a href="/samples/pir-sample.pdf" download className="text-accent hover:underline">baggage report (PIR)</a>.
            </p>
          </div>
          <div>
            <label htmlFor="paste" className="label">Or paste an airline SMS / email / boarding-pass barcode text</label>
            <textarea id="paste" rows={5} className="field min-h-[150px] font-mono text-[13px]!" value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="Dear Customer, your flight 6E 2134 DEL-BOM on 14 Dec 2026 at 06:10 has been cancelled… PNR: X7K2QP" />
          </div>
        </div>
        {files.length > 0 && (
          <ul className="mt-5 divide-y divide-line overflow-hidden rounded-xl bg-fill">
            {files.map((f, idx) => (
              <li key={f.key} className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm">
                <FileText size={16} className="shrink-0 text-muted" aria-hidden />
                <span className="min-w-0 flex-1 truncate">{f.file.name}</span>
                {f.status === "uploading" && <span className="text-xs text-muted">Uploading…</span>}
                {f.status === "error" && <span className="text-xs text-bad">Upload failed</span>}
                <select
                  aria-label={`Document type for ${f.file.name}`}
                  className="field w-auto! bg-surface! py-1! text-xs!"
                  value={f.kind}
                  onChange={(e) => setFiles((fs) => fs.map((x, i) => (i === idx ? { ...x, kind: e.target.value as DocKind | "auto" } : x)))}
                >
                  <option value="auto">Detect automatically</option>
                  {Object.entries(DOC_KIND_LABELS).map(([k, l]) => (
                    <option key={k} value={k}>{l}</option>
                  ))}
                </select>
                <button type="button" aria-label={`Remove ${f.file.name}`} className="flex size-6 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-bad" onClick={() => setFiles((fs) => fs.filter((_, k) => k !== idx))}><X size={14} aria-hidden /></button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" className={`btn-ghost ${(parsing || uploading || (!paste.trim() && !files.length)) ? "" : "!bg-[#0066CC] !text-white hover:!bg-[#005bb5]"}`} disabled={parsing || uploading || (!paste.trim() && !files.length)} onClick={() => autofill()}>
            {parsing ? "Reading…" : "Extract details"}
          </button>
          {parsed && (
            <p className="text-sm text-muted">
              {parsed.results.length
                ? `Found: ${[...new Set(parsed.results.flatMap((r) => r.found))].join(", ") || "nothing recognisable"}.`
                : "No readable text found."}{" "}
              {parsed.unreadable.length > 0 && <span>Could not read: {parsed.unreadable.join("; ")}.</span>} We filled in what we found. Check it on the next steps.
            </p>
          )}
        </div>
      </section>
      )}

      {step === "what" && (
      <section key="what" className="card reveal p-6 sm:p-7">
        <h2 className="title-2 mb-5" id="disruptionType">What happened?</h2>
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {TYPES.map((t) => (
            <label key={t.id} className={`pressable cursor-pointer rounded-2xl p-4 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-accent-soft ${type === t.id ? "border-2 border-[#0066CC] bg-blue-50/40 shadow-[inset_0_0_0_2px_var(--accent)]" : "bg-fill hover:bg-surface-2"}`}>
              <input type="radio" name="disruptionType" value={t.id} checked={type === t.id} onChange={() => set("disruptionType")(t.id)} className="sr-only" />
              <span className={`block text-sm font-medium ${type === t.id ? "text-accent" : ""}`}>{t.title}</span>
              <span className="mt-0.5 block text-xs text-muted">{t.desc}</span>
            </label>
          ))}
        </div>
        {type && (
          <p className="footnote mt-3 rounded-xl bg-accent-soft px-4 py-2 text-accent">
            {type === "delay" ? "Compensation depends on delay duration at arrival. Over 6 hours: meals, hotel (if overnight), and re-routing/refund options." :
             type === "cancellation" ? "If notified less than 24 hours before departure without a suitable alternate flight, cash compensation applies." :
             type === "denied_boarding" ? "Compensation ranges from base fare to 4× base fare depending on alternate flight timing." :
             type === "baggage" ? "Report damage within 7 days, delay within 21 days. Montreal Convention limits: ~1,519 SDR (≈₹1.8 lakh) per passenger." :
             "Airlines must refund within 7 days (card) or 30 working days (agent). We help escalate overdue refunds."}
          </p>
        )}
        {err("disruptionType")}
      </section>
      )}

      {step === "flight" && (
      <section key="flight" className="card reveal p-6 sm:p-7">
        <h2 className="title-2 mb-5">Flight details</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="pnr" className="label">PNR / booking reference</label>
            <input className="field uppercase" {...bind("pnr")} maxLength={8} placeholder="X7K2QP" />
            {err("pnr")}
          </div>
          <div>
            <label htmlFor="airline" className="label">Airline</label>
            <input className="field" list="airlines" {...bind("airline")} placeholder="IndiGo" onChange={(e) => { set("airline")(e.target.value); const prefix = e.target.value.trim().toUpperCase(); const match = Object.entries(AIRLINES).find(([code]) => prefix === code); if (match) set("airline")(match[1]); }} />
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
            <select className="field truncate" {...bind("airlineReason")}>
              {REASONS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="scheduledDeparture" className="label">Scheduled departure</label>
            <DateTimeField id="scheduledDeparture" withTime value={v.scheduledDeparture ?? ""} onChange={set("scheduledDeparture")} invalid={!!errors.scheduledDeparture} placeholder="Select date and time" />
            <p className="hint">Local time at origin</p>
            {err("scheduledDeparture")}
          </div>
          <div>
            <label htmlFor="scheduledArrival" className="label">Scheduled arrival</label>
            <DateTimeField id="scheduledArrival" withTime value={v.scheduledArrival ?? ""} onChange={set("scheduledArrival")} invalid={!!errors.scheduledArrival} placeholder="Select date and time" />
            <p className="hint">Local time at destination. Used to work out block time.</p>
            {err("scheduledArrival")}
          </div>
          {type === "delay" && (
            <div>
              <label htmlFor="actualDeparture" className="label">Actual departure</label>
              <DateTimeField id="actualDeparture" withTime value={v.actualDeparture ?? ""} onChange={set("actualDeparture")} invalid={!!errors.actualDeparture} placeholder="Select date and time" />
              {err("actualDeparture")}
            </div>
          )}
        </div>
      </section>
      )}

      {/* 4. Type-specific */}
      {step === "details" && type && (
        <section key={type} className="card reveal p-6 sm:p-7">
          <h2 className="title-2 mb-5">About the {TYPES.find((t) => t.id === type)?.title.toLowerCase()}</h2>
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
                  <>
                    <div>
                      <label htmlFor="alternateDeparture" className="label">Alternate flight departure</label>
                      <DateTimeField id="alternateDeparture" withTime value={v.alternateDeparture ?? ""} onChange={set("alternateDeparture")} invalid={!!errors.alternateDeparture} placeholder="Select date and time" />
                    </div>
                    <div>
                      <label htmlFor="alternateDelayTier" className="label">How much later was the alternate?</label>
                      <select className="field" {...bind("alternateDelayTier")}>
                        <option value="">Select</option>
                        <option value="under1h">Under 1 hour later</option>
                        <option value="1to2h">1–2 hours later</option>
                        <option value="2to4h">2–4 hours later</option>
                        <option value="over4h">Over 4 hours later</option>
                        <option value="nextday">Next day or later</option>
                      </select>
                    </div>
                  </>
                )}
              </>
            )}
            {(type === "delay" || type === "cancellation" || type === "denied_boarding") && (
              <>
                <YesNo name="missedConnection" label="Did you miss a connecting flight?" value={v.missedConnection ?? ""} onChange={set("missedConnection")} />
                {v.missedConnection === "true" && (
                  <>
                    <YesNo name="singlePnr" label="Were both flights on the same PNR?" value={v.singlePnr ?? ""} onChange={set("singlePnr")} />
                    {v.singlePnr === "false" && (
                      <p className="footnote rounded-xl bg-warn-soft px-4 py-2 text-warn sm:col-span-2">
                        Separate-PNR connections are not protected by the airline. Travel insurance or card cover may help — we&apos;ll check this in the assessment.
                      </p>
                    )}
                  </>
                )}
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
                    <DateTimeField id="baggageReceivedOn" value={v.baggageReceivedOn ?? ""} onChange={set("baggageReceivedOn")} invalid={!!errors.baggageReceivedOn} />
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
                  <DateTimeField id="refundRequestedOn" value={v.refundRequestedOn ?? ""} onChange={set("refundRequestedOn")} invalid={!!errors.refundRequestedOn} />
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

      {step === "fare" && (
      <section key="fare" className="card reveal p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
          <div>
            <h2 className="title-2">Fare & payment</h2>
            <p className="footnote mt-0.5 text-muted">Airlines calculate DGCA caps from basic fare + fuel, and refunds from total paid.</p>
          </div>
          {(autofilled.basicFarePlusFuel || autofilled.totalFare || autofilled.bookingDate) && (
            <span className="caption inline-flex items-center gap-1.5 rounded-full bg-ok-soft px-2.5 py-1 font-semibold text-ok">
              <Check size={13} strokeWidth={2.5} aria-hidden /> Pre-filled from document
            </span>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="basicFarePlusFuel" className="label mb-0!">Basic fare + fuel charge (₹)</label>
              {autofilled.basicFarePlusFuel && (
                <span className="caption inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 font-medium text-accent">
                  Pre-filled
                </span>
              )}
            </div>
            <input type="number" min={0} className="field" {...bind("basicFarePlusFuel")} placeholder="e.g. 50500" />
            <p className="hint">From the fare breakup, for this one-way sector. DGCA caps compensation at this amount.</p>
            {Number(v.basicFarePlusFuel || 0) > 0 && Number(v.totalFare || 0) > 0 && Number(v.basicFarePlusFuel) > Number(v.totalFare) && (
              <p className="caption mt-2 rounded-lg bg-warn-soft px-3 py-1.5 font-medium text-warn flex items-center gap-1.5" role="alert">
                <span>⚠️</span> Excludes taxes/airport fees; must be ≤ Total paid.
              </p>
            )}
            {err("basicFarePlusFuel")}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="totalFare" className="label mb-0!">Total paid (₹)</label>
              {autofilled.totalFare && (
                <span className="caption inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 font-medium text-accent">
                  Pre-filled
                </span>
              )}
            </div>
            <input type="number" min={0} className="field" {...bind("totalFare")} placeholder="e.g. 55300" />
            <p className="hint">Total invoice amount including all taxes, airport development fees and surcharges.</p>
            {err("totalFare")}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="bookingDate" className="label mb-0!">Booking date</label>
              {autofilled.bookingDate && (
                <span className="caption inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 font-medium text-accent">
                  Pre-filled
                </span>
              )}
            </div>
            <DateTimeField id="bookingDate" value={v.bookingDate ?? ""} onChange={set("bookingDate")} invalid={!!errors.bookingDate} />
            <p className="hint">Date the ticket was issued.</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="paymentMethod" className="label mb-0!">Paid by / Card selector <span className="font-normal text-muted">(optional)</span></label>
              {v.paymentMethod === "credit_card" && (
                <span className="caption rounded-full bg-ok-soft px-2 py-0.5 font-medium text-ok">
                  Card cover eligible
                </span>
              )}
            </div>
            <select className="field" {...bind("paymentMethod")}>
              <option value="credit_card">Credit card (Visa, Mastercard, Amex, RuPay)</option>
              <option value="debit_card">Debit card</option>
              <option value="upi">UPI (GPay, PhonePe, Paytm)</option>
              <option value="netbanking">Net banking</option>
              <option value="wallet">Wallet</option>
              <option value="cash">Cash</option>
            </select>
            <p className="hint">Links card-cover and chargeback recovery paths from one set of records.</p>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="bookingChannel" className="label">Booked through</label>
            <select className="field" {...bind("bookingChannel")}>
              <option value="airline">Airline website / app / office (refund deadline: within 7 days)</option>
              <option value="agent">Travel agent / portal (MakeMyTrip, etc. - refund deadline: 30 working days)</option>
            </select>
            <p className="hint">Airlines refund card payments within 7 days; booking through an OTA allows up to 30 working days under DGCA rules.</p>
          </div>
        </div>
      </section>
      )}

      {step === "you" && (
      <section key="you" className="card reveal p-6 sm:p-7">
        <h2 className="title-2">Passenger contact details</h2>
        <p className="footnote mt-1 mb-5 text-muted">
          Under DGCA CAR Section 3 Series M, formal legal demands and AirSewa tickets must be issued in the ticketed passenger&apos;s legal name and contact details for airline nodal officer verification.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="passengerName" className="label mb-0!">Passenger name</label>
              {v.passengerName && (
                <span className="caption inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 font-medium text-accent">
                  Verified
                </span>
              )}
            </div>
            <input className="field" {...bind("passengerName")} autoComplete="name" />
            {err("passengerName")}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="email" className="label mb-0!">Email</label>
              {v.email && (
                <span className="caption inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 font-medium text-accent">
                  Verified
                </span>
              )}
            </div>
            <input type="email" className="field" {...bind("email")} autoComplete="email" />
            {err("email")}
          </div>
          <div>
            <label htmlFor="phone" className="label">Phone</label>
            <input type="tel" className="field" {...bind("phone")} autoComplete="tel" placeholder="e.g. +91 98765 43210" />
            <p className="hint">Used for airline nodal officer verification & updates.</p>
          </div>
          <div className="sm:col-span-3">
            <label htmlFor="notes" className="label">Anything else? (optional)</label>
            <textarea rows={3} className="field" {...bind("notes")} placeholder="What the staff told you, what you spent, how you were treated…" />
          </div>
        </div>
      </section>
      )}

      {(errors.form || errors.files) && <p className="footnote mt-4 text-bad">{errors.form ?? errors.files}</p>}
      <div className="mt-6 flex items-center justify-between gap-3">
        {i > 0 ? (
          <button type="button" className="btn-ghost px-5! py-2.5!" onClick={() => { setErrors({}); go(i - 1); }}>
            <ChevronLeft size={16} aria-hidden /> Back
          </button>
        ) : (
          <span className="footnote text-muted">We only use your details to prepare this claim.</span>
        )}
        {last ? (
          <button type="submit" className="btn-primary px-6! py-2.5!" disabled={submitting || uploading}>
            {uploading ? "Waiting for uploads…" : submitting ? "Assessing your claim…" : "Assess my claim"}
          </button>
        ) : (
          <button type="button" className="btn-primary px-6! py-2.5!" onClick={next} disabled={uploading && step === "docs"}>
            {step === "docs" && !files.length && !paste.trim() ? "Skip for now" : "Continue"} <ChevronRight size={16} aria-hidden />
          </button>
        )}
      </div>
    </form>
  );
}

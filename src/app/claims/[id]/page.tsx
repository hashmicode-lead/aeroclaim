import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Countdown, EvidenceUploader, RecheckButton } from "@/components/client";
import { Section, StatusBadge } from "@/components/ui";
import { getAirport } from "@/lib/airports";
import { getClaim } from "@/lib/db";
import { FEES, payoutSplit, qualifyNoWin } from "@/lib/pricing";
import { formatDate, formatDateTime, money } from "@/lib/time";
import { DOC_KIND_LABELS, type WeatherSeverity } from "@/lib/types";

const TYPE = { delay: "Flight delay", cancellation: "Flight cancellation", denied_boarding: "Denied boarding", baggage: "Baggage claim", refund: "Ticket refund" };
const RISK = {
  low: { label: "Low risk", cls: "bg-ok-soft text-ok" },
  medium: { label: "Medium risk", cls: "bg-warn-soft text-warn" },
  high: { label: "High risk", cls: "bg-bad-soft text-bad" },
};
const SEV: Record<WeatherSeverity, { label: string; cls: string }> = {
  none: { label: "Clear", cls: "bg-ok-soft text-ok" },
  moderate: { label: "Marginal", cls: "bg-warn-soft text-warn" },
  severe: { label: "Severe", cls: "bg-bad-soft text-bad" },
  unavailable: { label: "No data", cls: "bg-fill text-muted" },
};

const hm = (m: number) => `${Math.floor(m / 60)}h ${m % 60}m`;

function Check({ state }: { state: "ok" | "missing" | "optional" }) {
  if (state === "ok")
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-label="Provided" className="shrink-0 text-ok">
        <circle cx="12" cy="12" r="10" fill="currentColor" />
        <path d="m7.5 12.5 3 3 6-6.5" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-label={state === "missing" ? "Missing" : "Optional"} className={`shrink-0 ${state === "missing" ? "text-bad" : "text-muted/50"}`}>
      <circle cx="12" cy="12" r="9.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {state === "missing" && <path d="M12 7.5v5.5M12 16.2v.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
    </svg>
  );
}

async function ClaimReport({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const claim = await getClaim(id);
  if (!claim) notFound();
  const { input: i, assessment: a, weather } = claim;
  const o = getAirport(i.origin);
  const d = getAirport(i.destination);
  const missing = a.evidence.filter((e) => e.required && !e.provided).length;
  const q = qualifyNoWin(a);

  return (
    <div className="reveal">
      {/* Title */}
      <header className="px-1">
        <p className="eyebrow">{TYPE[i.disruptionType]} · PNR {i.pnr}</p>
        {i.protectionTier && (
          <p className="caption mt-2 inline-flex items-center gap-1 rounded-full bg-ok-soft px-2.5 py-0.5 font-semibold text-ok">
            Protected · {i.protectionTier === "annual_pass" ? "Annual Pass" : "Trip Shield"}
          </p>
        )}
        <h1 className="title-1 mt-2">
          {o?.city ?? i.origin} <span className="text-muted">→</span> {d?.city ?? i.destination}
        </h1>
        <p className="footnote mt-1.5 text-muted">
          {i.airline} {i.flightNumber} · {formatDateTime(i.scheduledDeparture)} · {a.isInternational ? "International" : "Domestic"}
          {a.blockTimeMinutes ? ` · ${hm(a.blockTimeMinutes)} block` : ""}
          {a.delayMinutes !== undefined ? ` · delayed ${hm(a.delayMinutes)}` : ""}
        </p>
      </header>

      {/* Hero figure */}
      <section className="card mt-6 p-7 sm:p-9">
        <p className="footnote font-medium text-muted">Estimated recoverable</p>
        <p className="display mt-1 tabular-nums">{a.estimate.max ? money(a.estimate) : "-"}</p>
        <p className="footnote mt-2 max-w-xl text-muted">
          {!a.estimate.max
            ? "Add the missing details below for an estimate."
            : a.estimate.min !== a.estimate.max
              ? "The low end assumes the airline wins every contestable point. Documented expenses come on top."
              : "Statutory amounts only. Reimbursement of your documented expenses comes on top."}
        </p>
        <div className="mt-5 flex flex-wrap items-start gap-3 border-t border-line pt-5">
          <span className={`caption shrink-0 rounded-full px-2.5 py-1 font-semibold ${RISK[a.extraordinaryRisk].cls}`}>{RISK[a.extraordinaryRisk].label}</span>
          <p className="footnote flex-1 text-ink/80">{a.extraordinaryNote}</p>
        </div>
        <div className="no-print mt-6 flex flex-wrap gap-2">
          <Link href={`/claims/${claim.id}/packet`} className="btn-primary">Open claim packet</Link>
          <a href={`/api/claims/${claim.id}/calendar`} className="btn-ghost">Add deadlines to calendar</a>
          <RecheckButton id={claim.id} />
        </div>
      </section>

      {/* Recovery tracks: success fee only for claims that pass the qualification check */}
      <section className="no-print mt-10">
        <div className="mb-2 flex items-baseline justify-between gap-4 px-1">
          <h2 className="title-2">Ways to recover</h2>
          <span className="footnote text-muted">Claim strength <strong className={q.qualifies ? "text-ok" : "text-warn"}>{q.score}/100</strong></span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className={`card p-6 ${q.qualifies ? "shadow-[inset_0_0_0_2px_var(--accent),var(--shadow-card)]" : "opacity-70"}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="headline">We file it for you*</span>
              {q.qualifies ? <span className="caption rounded-full bg-ok-soft px-2 py-0.5 font-semibold text-ok">You qualify</span> : <span className="caption rounded-full bg-fill px-2 py-0.5 font-semibold text-muted">Not available</span>}
            </div>
            <p className="footnote mt-1 text-muted">₹0 upfront · {FEES.standardPct}% if we win ({FEES.escalatedPct}% if it goes to the consumer commission)</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-fill"><div className={`h-full rounded-full ${q.qualifies ? "bg-ok" : "bg-warn"}`} style={{ width: `${q.score}%` }} /></div>
            {q.qualifies ? (
              <>
                <p className="footnote mt-3">You would receive about <strong>{money({ min: payoutSplit(a.estimate.min).youGet, max: payoutSplit(a.estimate.max).youGet })}</strong>.</p>
                {q.strengths.length > 0 && <p className="caption mt-1 text-muted">{q.strengths.join(" · ")}</p>}
              </>
            ) : (
              <ul className="footnote mt-3 space-y-1 text-muted">{q.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
            )}
          </div>
          <div className={`card p-6 ${q.qualifies ? "" : "shadow-[inset_0_0_0_2px_var(--accent),var(--shadow-card)]"}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="headline">Self-file kit</span>
              {!q.qualifies && <span className="caption rounded-full bg-accent px-2 py-0.5 font-semibold text-white">Recommended</span>}
            </div>
            <p className="footnote mt-1 text-muted">₹{FEES.diyKit} one-time · keep 100%</p>
            <p className="footnote mt-3">Every letter and packet ready to send yourself, with reminders before each deadline.</p>
            <Link href={`/claims/${claim.id}/packet`} className={`${q.qualifies ? "btn-ghost" : "btn-primary"} mt-4`}>Get the kit</Link>
          </div>
        </div>
        <p className="caption mt-3 px-1 text-muted">*No win, no fee is offered only after we check your claim&apos;s risk. Depending on that check, the fee can change (25% if a consumer-commission filing is needed), or we may offer the ₹299 self-file kit instead.</p>
      </section>

      <div className="mt-10 grid gap-10">
        <Section title="Entitlements">
          <ul className="-my-1 divide-y divide-line">
            {a.findings.map((f) => (
              <li key={f.id} className="py-4 first:pt-1 last:pb-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="headline">{f.title}</span>
                  <StatusBadge status={f.status} />
                  {f.amount && f.status !== "not_eligible" && <span className="headline ml-auto tabular-nums">{money(f.amount)}</span>}
                </div>
                <p className="footnote mt-1.5 text-ink/80">{f.explanation}</p>
                <p className="caption mt-1 text-muted">{f.basis}</p>
              </li>
            ))}
          </ul>
        </Section>

        {a.dutyOfCare.length > 0 && (
          <Section title="Duty of care">
            <ul className="space-y-2.5">
              {a.dutyOfCare.map((x) => (
                <li key={x} className="flex gap-3">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                  <span className="footnote">{x}</span>
                </li>
              ))}
            </ul>
            <p className="caption mt-4 text-muted">These apply even when the disruption was caused by genuine bad weather. Extraordinary circumstances only remove cash compensation.</p>
          </Section>
        )}

        {weather && (
          <Section title="Weather check" aside={<span className="caption text-muted">Open-Meteo · {formatDate(weather.checkedAt.slice(0, 10))}</span>}>
            <p className="headline">{weather.verdict}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {weather.airports.map((ap) => (
                <div key={ap.role} className="rounded-2xl bg-fill p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="headline">{ap.airport}</div>
                      <div className="caption capitalize text-muted">{ap.role} · around {ap.around.slice(11)}</div>
                    </div>
                    <span className={`caption rounded-full px-2.5 py-0.5 font-semibold ${SEV[ap.severity].cls}`}>{SEV[ap.severity].label}</span>
                  </div>
                  <p className="caption mt-2 text-muted">{ap.summary}</p>
                  {ap.hours.length > 0 && (
                    <table className="caption mt-3 w-full tabular-nums">
                      <thead className="text-muted">
                        <tr className="text-left">
                          <th className="pb-1 font-medium">Local</th>
                          <th className="pb-1 font-medium">Conditions</th>
                          <th className="pb-1 text-right font-medium">Vis.</th>
                          <th className="pb-1 text-right font-medium">Gust</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ap.hours.map((h) => (
                          <tr key={h.time} className={`border-t border-line ${h.severity === "severe" ? "text-bad" : h.severity === "moderate" ? "text-warn" : ""}`}>
                            <td className="py-1 font-mono">{h.time.slice(11)}</td>
                            <td className="py-1">{h.description}</td>
                            <td className="py-1 text-right font-mono">{h.visibilityM !== null ? `${(h.visibilityM / 1000).toFixed(1)} km` : "-"}</td>
                            <td className="py-1 text-right font-mono">{h.gustKmh !== null ? Math.round(h.gustKmh) : "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}
            </div>
            <p className="caption mt-4 text-muted">
              Modelled hourly weather at the airport, not official METAR observations. It shows whether a weather explanation is plausible, but it cannot account for weather en route or knock-on delays from earlier flights.
            </p>
          </Section>
        )}

        <Section title="Deadlines" aside={<a href={`/api/claims/${claim.id}/calendar`} className="footnote text-accent hover:underline">Download .ics</a>}>
          <ul className="-my-1 divide-y divide-line">
            {a.deadlines.map((dl) => (
              <li key={dl.id} className="flex items-start gap-4 py-4 first:pt-1 last:pb-1">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="headline">{dl.title}</span>
                    {dl.hard && <span className="caption rounded-full bg-bad-soft px-2 py-0.5 font-semibold text-bad">Legal limit</span>}
                    {dl.kind === "airline" && <span className="caption rounded-full bg-info-soft px-2 py-0.5 font-semibold text-info">Airline must act</span>}
                  </div>
                  <p className="footnote mt-1 text-muted">{dl.description}</p>
                  <p className="caption mt-0.5 text-muted/80">{dl.basis}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="headline tabular-nums">{formatDate(dl.due)}</div>
                  <div className="footnote"><Countdown due={dl.due} /></div>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <div className="grid gap-10 lg:grid-cols-2">
          <Section title="Evidence" aside={missing > 0 ? <span className="footnote font-medium text-bad">{missing} missing</span> : <span className="footnote font-medium text-ok">Complete</span>}>
            <ul className="space-y-3.5">
              {a.evidence.map((e) => (
                <li key={e.id} className="flex gap-3">
                  <Check state={e.provided ? "ok" : e.required ? "missing" : "optional"} />
                  <div className="min-w-0">
                    <span className={`footnote ${e.provided || e.required ? "" : "text-muted"}`}>{e.label}</span>
                    {!e.provided && e.tip && <p className="caption mt-0.5 text-muted">{e.tip}</p>}
                  </div>
                </li>
              ))}
            </ul>
            {missing > 0 && <EvidenceUploader claimId={claim.id} />}
            {claim.documents.length > 0 && (
              <div className="mt-5 border-t border-line pt-4">
                <p className="eyebrow mb-2">Uploaded</p>
                <ul className="space-y-1.5">
                  {claim.documents.map((doc) => (
                    <li key={doc.id} className="flex justify-between gap-3">
                      <a href={`/api/documents/${doc.id}`} target="_blank" rel="noreferrer" className="footnote truncate text-accent hover:underline">{doc.filename}</a>
                      <span className="caption shrink-0 text-muted">{DOC_KIND_LABELS[doc.kind]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Section>
          <Section title="Next steps">
            <ol className="space-y-3.5">
              {a.nextSteps.map((s, n) => (
                <li key={s} className="flex gap-3">
                  <span className="caption flex size-[22px] shrink-0 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent">{n + 1}</span>
                  <span className="footnote">{s}</span>
                </li>
              ))}
            </ol>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div aria-busy className="space-y-6">
      <div className="h-20 w-2/3 animate-pulse rounded-2xl bg-fill" />
      <div className="card h-64 animate-pulse" />
      <div className="card h-48 animate-pulse" />
    </div>
  );
}

export default function ClaimPage({ params }: PageProps<"/claims/[id]">) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/claims" className="no-print footnote inline-flex items-center gap-1 text-accent hover:underline">
        <span aria-hidden>‹</span> All claims
      </Link>
      <div className="mt-5">
        <Suspense fallback={<Skeleton />}>
          <ClaimReport params={params} />
        </Suspense>
      </div>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Countdown, RecheckButton } from "@/components/client";
import { Section, StatusBadge } from "@/components/ui";
import { getAirport } from "@/lib/airports";
import { getClaim } from "@/lib/db";
import { formatDate, formatDateTime, money } from "@/lib/time";
import { DOC_KIND_LABELS, type WeatherSeverity } from "@/lib/types";

const TYPE = { delay: "Flight delay", cancellation: "Flight cancellation", denied_boarding: "Denied boarding", baggage: "Baggage claim", refund: "Ticket refund" };
const RISK = {
  low: { label: "Low", cls: "text-ok" },
  medium: { label: "Medium", cls: "text-warn" },
  high: { label: "High", cls: "text-bad" },
};
const SEV: Record<WeatherSeverity, string> = { none: "bg-ok-soft text-ok", moderate: "bg-warn-soft text-warn", severe: "bg-bad-soft text-bad", unavailable: "bg-surface-2 text-muted" };

async function ClaimReport({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const claim = getClaim(id);
  if (!claim) notFound();
  const { input: i, assessment: a, weather } = claim;
  const o = getAirport(i.origin);
  const d = getAirport(i.destination);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{TYPE[i.disruptionType]} · PNR {i.pnr} · {a.isInternational ? "International" : "Domestic"}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {i.flightNumber} · {o?.city ?? i.origin} → {d?.city ?? i.destination}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {i.airline} · scheduled {formatDateTime(i.scheduledDeparture)}
            {a.blockTimeMinutes ? ` · block time ${Math.floor(a.blockTimeMinutes / 60)}h ${a.blockTimeMinutes % 60}m` : ""}
            {a.delayMinutes !== undefined ? ` · delayed ${Math.floor(a.delayMinutes / 60)}h ${a.delayMinutes % 60}m` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <RecheckButton id={claim.id} />
          <a href={`/api/claims/${claim.id}/calendar`} className="btn-ghost px-3! py-1.5! text-xs">Add deadlines to calendar</a>
          <Link href={`/claims/${claim.id}/packet`} className="btn-primary px-3! py-1.5! text-xs">Open claim packet</Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-5 sm:col-span-2">
          <div className="text-sm text-muted">Estimated recoverable</div>
          <div className="mt-1 text-3xl font-semibold tracking-tight">{a.estimate.max ? money(a.estimate) : "Needs more info"}</div>
          <p className="mt-2 text-sm text-muted">
            {a.estimate.min !== a.estimate.max
              ? "The range runs from the amount if every contestable item is refused to the full statutory amount. Documented expenses come on top."
              : "Statutory amounts only. Reimbursement of your documented expenses comes on top."}
          </p>
        </div>
        <div className="card p-5">
          <div className="text-sm text-muted">Risk of an &lsquo;extraordinary circumstances&rsquo; defence</div>
          <div className={`mt-1 text-2xl font-semibold ${RISK[a.extraordinaryRisk].cls}`}>{RISK[a.extraordinaryRisk].label}</div>
          <p className="mt-2 text-xs text-muted">{a.extraordinaryNote}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4">
        <Section title="Your entitlements">
          <ul className="divide-y divide-line">
            {a.findings.map((f) => (
              <li key={f.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-medium">{f.title}</span>
                  <StatusBadge status={f.status} />
                  {f.amount && f.status !== "not_eligible" && <span className="ml-auto font-mono text-sm">{money(f.amount)}</span>}
                </div>
                <p className="mt-1 text-sm text-muted">{f.explanation}</p>
                <p className="mt-1 text-xs text-muted/80">{f.basis}</p>
              </li>
            ))}
          </ul>
        </Section>

        {a.dutyOfCare.length > 0 && (
          <Section title="Duty of care the airline owed you">
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {a.dutyOfCare.map((x) => <li key={x}>{x}</li>)}
            </ul>
            <p className="mt-3 text-xs text-muted">These apply even when the disruption was caused by genuine bad weather. Extraordinary circumstances only remove cash compensation.</p>
          </Section>
        )}

        {weather && (
          <Section title="Weather check" aside={<span className="text-xs text-muted">Open-Meteo · checked {formatDate(weather.checkedAt.slice(0, 10))}</span>}>
            <p className="text-sm">{weather.verdict}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {weather.airports.map((ap) => (
                <div key={ap.role} className="rounded-lg border border-line p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{ap.airport} · {ap.role}</div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${SEV[ap.severity]}`}>{ap.severity}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{ap.summary}</p>
                  {ap.hours.length > 0 && (
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="text-muted">
                          <tr className="text-left">
                            <th className="py-1 pr-2 font-normal">Local</th>
                            <th className="py-1 pr-2 font-normal">Conditions</th>
                            <th className="py-1 pr-2 text-right font-normal">Vis.</th>
                            <th className="py-1 text-right font-normal">Gust</th>
                          </tr>
                        </thead>
                        <tbody className="font-mono">
                          {ap.hours.map((h) => (
                            <tr key={h.time} className={h.severity === "severe" ? "text-bad" : h.severity === "moderate" ? "text-warn" : ""}>
                              <td className="py-0.5 pr-2">{h.time.slice(11)}</td>
                              <td className="py-0.5 pr-2 font-sans">{h.description}</td>
                              <td className="py-0.5 pr-2 text-right">{h.visibilityM !== null ? `${(h.visibilityM / 1000).toFixed(1)}km` : "-"}</td>
                              <td className="py-0.5 text-right">{h.gustKmh !== null ? Math.round(h.gustKmh) : "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">
              This uses modelled hourly weather at the airport, not official METAR observations. It shows whether a weather explanation is plausible but cannot account for weather en route or knock-on delays from earlier flights.
            </p>
          </Section>
        )}

        <Section title="Deadlines" aside={<a href={`/api/claims/${claim.id}/calendar`} className="text-xs text-accent hover:underline">Download .ics</a>}>
          <ul className="divide-y divide-line">
            {a.deadlines.map((dl) => (
              <li key={dl.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">
                    {dl.title}
                    {dl.hard && <span className="ml-2 rounded bg-bad-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase text-bad">Legal limit</span>}
                    {dl.kind === "airline" && <span className="ml-2 rounded bg-info-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase text-info">Airline must act</span>}
                  </div>
                  <p className="text-xs text-muted">{dl.description} <span className="text-muted/80">({dl.basis})</span></p>
                </div>
                <div className="text-right text-sm">
                  <div className="font-mono">{formatDate(dl.due)}</div>
                  <div className="text-xs"><Countdown due={dl.due} /></div>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <div className="grid gap-4 sm:grid-cols-2">
          <Section title="Evidence checklist">
            <ul className="space-y-2 text-sm">
              {a.evidence.map((e) => (
                <li key={e.id} className="flex gap-2">
                  <span aria-hidden className={e.provided ? "text-ok" : e.required ? "text-bad" : "text-muted"}>{e.provided ? "✓" : e.required ? "!" : "○"}</span>
                  <div>
                    <span className={e.provided ? "" : e.required ? "font-medium" : "text-muted"}>{e.label}</span>
                    {!e.provided && e.required && <span className="ml-1 text-xs text-bad">missing</span>}
                    {!e.provided && e.tip && <p className="text-xs text-muted">{e.tip}</p>}
                  </div>
                </li>
              ))}
            </ul>
            {claim.documents.length > 0 && (
              <div className="mt-4 border-t border-line pt-3">
                <div className="mb-1 text-xs font-medium text-muted">Uploaded</div>
                <ul className="space-y-1 text-sm">
                  {claim.documents.map((doc) => (
                    <li key={doc.id} className="flex justify-between gap-2">
                      <a href={`/api/documents/${doc.id}`} target="_blank" rel="noreferrer" className="truncate text-accent hover:underline">{doc.filename}</a>
                      <span className="shrink-0 text-xs text-muted">{DOC_KIND_LABELS[doc.kind]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Section>
          <Section title="Next steps">
            <ol className="list-decimal space-y-2 pl-5 text-sm">
              {a.nextSteps.map((s) => <li key={s}>{s}</li>)}
            </ol>
          </Section>
        </div>
      </div>
    </>
  );
}

export default function ClaimPage({ params }: PageProps<"/claims/[id]">) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/claims" className="text-sm text-muted hover:text-ink">← All claims</Link>
      <div className="mt-4">
        <Suspense fallback={<div className="card h-64 animate-pulse" />}>
          <ClaimReport params={params} />
        </Suspense>
      </div>
    </div>
  );
}

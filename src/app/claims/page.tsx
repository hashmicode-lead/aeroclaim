import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Countdown } from "@/components/client";
import { getAirport } from "@/lib/airports";
import { listClaims } from "@/lib/db";
import { formatDate, money, todayIST } from "@/lib/time";

export const metadata: Metadata = { title: "My claims" };

const TYPE = { delay: "Delay", cancellation: "Cancellation", denied_boarding: "Denied boarding", baggage: "Baggage", refund: "Refund" };

async function ClaimList() {
  await connection();
  const claims = await listClaims();
  const today = todayIST();
  if (!claims.length)
    return (
      <div className="card px-6 py-16 text-center">
        <p className="title-2">No claims yet</p>
        <p className="footnote mt-1 text-muted">Start one in about two minutes. Have your ticket handy.</p>
        <Link href="/claims/new" className="btn-primary mt-6">Start a claim</Link>
      </div>
    );
  return (
    <ul className="card divide-y divide-line overflow-hidden">
      {claims.map((c) => {
        const next = c.assessment.deadlines.find((d) => d.kind === "passenger" && d.due >= today);
        return (
          <li key={c.id}>
            <Link href={`/claims/${c.id}`} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-2 active:bg-fill">
              <div className="min-w-0 flex-1">
                <div className="headline truncate">
                  {getAirport(c.input.origin)?.city ?? c.input.origin} → {getAirport(c.input.destination)?.city ?? c.input.destination}
                </div>
                <div className="footnote truncate text-muted">
                  {TYPE[c.input.disruptionType]} · {c.input.flightNumber} · {formatDate(c.input.scheduledDeparture.slice(0, 10))}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="headline tabular-nums">{c.assessment.estimate.max ? money(c.assessment.estimate) : "-"}</div>
                {next && (
                  <div className="caption text-muted">
                    {next.title.split(" (")[0]}: <Countdown due={next.due} />
                  </div>
                )}
              </div>
              <span aria-hidden className="text-muted/50">›</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function ClaimsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-end justify-between gap-4 px-1">
        <h1 className="title-1">My claims</h1>
        <Link href="/claims/new" className="btn-primary">New claim</Link>
      </div>
      <div className="mt-6">
        <Suspense fallback={<div className="card h-40 animate-pulse" />}>
          <ClaimList />
        </Suspense>
      </div>
    </div>
  );
}

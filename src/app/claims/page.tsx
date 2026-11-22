import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Countdown } from "@/components/client";
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
      <div className="card p-10 text-center">
        <p className="text-muted">No claims yet.</p>
        <Link href="/claims/new" className="btn-primary mt-4">Start your first claim</Link>
      </div>
    );
  return (
    <ul className="card divide-y divide-line">
      {claims.map((c) => {
        const next = c.assessment.deadlines.find((d) => d.kind === "passenger" && d.due >= today);
        return (
          <li key={c.id}>
            <Link href={`/claims/${c.id}`} className="flex flex-wrap items-center gap-x-6 gap-y-1 px-5 py-4 hover:bg-surface-2">
              <div className="min-w-0 flex-1">
                <div className="font-medium">
                  {c.input.flightNumber} · {c.input.origin} → {c.input.destination}
                </div>
                <div className="text-sm text-muted">
                  {TYPE[c.input.disruptionType]} · PNR {c.input.pnr} · {formatDate(c.input.scheduledDeparture.slice(0, 10))}
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="font-medium">{c.assessment.estimate.max ? money(c.assessment.estimate) : "-"}</div>
                {next && (
                  <div className="text-xs">
                    {next.title}: <Countdown due={next.due} />
                  </div>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function ClaimsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">My claims</h1>
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

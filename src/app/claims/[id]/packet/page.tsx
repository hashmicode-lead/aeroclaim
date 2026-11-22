import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { CopyButton, PrintButton } from "@/components/client";
import { getClaim } from "@/lib/db";
import { buildPacket } from "@/lib/packet";
import { formatDate, todayIST } from "@/lib/time";

async function Packet({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const claim = getClaim(id);
  if (!claim) notFound();
  const today = todayIST();
  const p = buildPacket(claim, today);

  return (
    <>
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href={`/claims/${claim.id}`} className="text-sm text-muted hover:text-ink">← Back to assessment</Link>
        <div className="flex gap-2">
          <CopyButton text={`${p.subject}\n\n${p.body}`} label="Copy letter" />
          <PrintButton />
        </div>
      </div>
      <p className="no-print mb-6 rounded-lg bg-info-soft p-4 text-sm text-info">
        Send this letter by email to the airline&apos;s customer care and copy its nodal grievance officer. Contact details are on the airline&apos;s &ldquo;Grievance redressal&rdquo; page. Attach the annexures listed. Keep the sent email: it is your proof of written notice.
      </p>

      <article className="card space-y-8 p-8 print:border-0 print:p-0">
        <header>
          <div className="text-xs uppercase tracking-wide text-muted">Part 1 · Claim letter</div>
          <div className="mt-4 text-sm">
            <div>{formatDate(today)}</div>
            <div className="mt-2">To,</div>
            <div>{p.to}</div>
          </div>
        </header>
        <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed">{p.body}</pre>

        <section className="break-before-page">
          <div className="text-xs uppercase tracking-wide text-muted">Part 2 · Chronology of events</div>
          <table className="mt-3 w-full text-sm">
            <tbody>
              {p.chronology.map((c, idx) => (
                <tr key={idx} className="border-b border-line align-top">
                  <td className="w-48 py-2 pr-4 font-mono text-xs">{c.when}</td>
                  <td className="py-2">{c.what}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <div className="text-xs uppercase tracking-wide text-muted">Part 3 · Index of annexures</div>
          {p.annexures.length ? (
            <table className="mt-3 w-full text-sm">
              <tbody>
                {p.annexures.map((x) => (
                  <tr key={x.no} className="border-b border-line">
                    <td className="w-16 py-2 font-mono text-xs">{x.no}</td>
                    <td className="py-2">{x.label}</td>
                    <td className="py-2 text-right text-xs text-muted">{x.filename}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="mt-3 text-sm text-muted">No documents uploaded. Attach your e-ticket, boarding pass and receipts before sending.</p>
          )}
          {claim.assessment.evidence.some((e) => e.required && !e.provided) && (
            <p className="mt-3 text-sm text-bad">
              Still missing: {claim.assessment.evidence.filter((e) => e.required && !e.provided).map((e) => e.label).join("; ")}.
            </p>
          )}
        </section>

        <footer className="text-xs text-muted">
          Prepared with AeroClaim OS. This is a self-prepared claim and not legal advice.
        </footer>
      </article>
    </>
  );
}

export default function PacketPage({ params }: PageProps<"/claims/[id]/packet">) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 print:max-w-none print:p-0">
      <Suspense fallback={<div className="card h-96 animate-pulse" />}>
        <Packet params={params} />
      </Suspense>
    </div>
  );
}

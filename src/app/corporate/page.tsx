"use client";

import { Download, FileSpreadsheet, Search, Upload, Users, X } from "lucide-react";
import { ClientStories } from "@/components/ClientStories";
import { ClientWall } from "@/components/ClientWall";
import { PartnerStrip } from "@/components/PartnerStrip";
import { EmptyHome } from "@/components/EmptyHome";
import { useSession, signIn } from "@/components/session";
import { useRef, useMemo, useState } from "react";
import { corporate, inr } from "@/lib/demo";

const STATUS_TONE: Record<string, string> = {
  Settled: "bg-ok-soft text-ok",
  "Claim sent": "bg-info-soft text-info",
  "Chargeback ready": "bg-warn-soft text-warn",
  "Awaiting PIR": "bg-bad-soft text-bad",
  "Refund requested": "bg-info-soft text-info",
  "Meals only": "bg-fill text-muted",
};

function InviteModal({ onClose }: { onClose: () => void }) {
  const [emails, setEmails] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="reveal card w-full max-w-md p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="title-2">Invite your team</h2>
          <button onClick={onClose} className="text-muted hover:text-ink" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {sent ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-ok-soft text-xl text-ok">✓</div>
            <p className="headline">Invites sent!</p>
            <p className="footnote mt-1 text-muted">Your colleagues will receive an email to join the PNR audit workspace.</p>
            <button onClick={onClose} className="btn-primary mt-5">Done</button>
          </div>
        ) : (
          <>
            <p className="footnote mb-4 text-muted">Add finance and travel-desk colleagues. They'll get access to the PNR audit and recovery dashboard.</p>
            <label className="label" htmlFor="invite-emails">Email addresses (comma-separated)</label>
            <textarea
              id="invite-emails"
              rows={3}
              className="field mt-1 font-mono text-xs!"
              placeholder="finance@company.com, travel@company.com"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={onClose} className="btn-ghost">Cancel</button>
              <button className="btn-primary" disabled={!emails.trim()} onClick={() => setSent(true)}>
                Send invites
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CorporatePage() {
  const session = useSession();
  const fileRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [toast, setToast] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const rows = useMemo(
    () => corporate.rows.filter((r) => `${r.emp} ${r.dept} ${r.pnr} ${r.flight} ${r.issue}`.toLowerCase().includes(q.toLowerCase())),
    [q],
  );

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2800);
  };

  function loadDemoAudit() {
    signIn({ name: session?.name ?? "Corporate User", email: session?.email ?? "admin@company.com", role: "corporate", isNew: false, org: session?.org ?? "Your company" });
    flash("214 PNRs uploaded — 18 have recoverable value. Loading audit…");
  }

  if (session?.isNew)
    return (
      <>
        <div className="reveal mx-auto max-w-5xl px-4 py-10">
          <div className="px-1">
            <p className="footnote text-muted">{session.org || "Your company"}</p>
            <h1 className="title-1 mt-0.5">Set up your PNR audit</h1>
            <p className="mt-1.5 max-w-xl text-muted">Upload your travel desk&apos;s bookings and we&apos;ll find delayed, cancelled and unrefunded tickets.</p>
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
            <div className="space-y-3">
              {/* Upload bookings */}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="pressable card group flex w-full items-center gap-4 p-5 text-left hover:bg-surface-2 shadow-[inset_0_0_0_2px_var(--accent),var(--shadow-card)]"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-white">
                  <FileSpreadsheet size={20} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="headline block">Upload bookings (CSV or Excel)</span>
                  <span className="footnote block text-muted">PNR, employee, flight and fare columns. We match the rest.</span>
                </span>
                <span className="text-muted">→</span>
              </button>

              {/* Invite team */}
              <button
                type="button"
                onClick={() => setShowInvite(true)}
                className="pressable card group flex w-full items-center gap-4 p-5 text-left hover:bg-surface-2"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Users size={20} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="headline block">Invite your team</span>
                  <span className="footnote block text-muted">Add finance and travel-desk colleagues.</span>
                </span>
                <span className="text-muted">→</span>
              </button>

              <div className="card mt-6 px-6 py-10 text-center">
                <p className="headline">No bookings yet</p>
                <p className="footnote mx-auto mt-1 max-w-sm text-muted">Your PNR audit, recoverable amounts and finance reports will appear here once you upload your first file.</p>
                <button type="button" onClick={loadDemoAudit} className="btn-ghost mt-4">
                  Load sample audit (214 PNRs demo)
                </button>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="card p-5">
                <p className="headline">Get set up</p>
                <ul className="mt-3 space-y-3">
                  {["Create your business account", "Upload your first bookings file", "Invite a colleague", "Choose a plan (₹4,999/mo)"].map((c, i) => (
                    <li key={c} className="footnote flex items-start gap-3">
                      <span className={`caption mt-px flex size-5 shrink-0 items-center justify-center rounded-full font-semibold ${i === 0 ? "bg-ok text-white" : "bg-fill text-muted"}`}>
                        {i === 0 ? "✓" : i + 1}
                      </span>
                      <span className={i === 0 ? "text-muted line-through" : ""}>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card p-5">
                <p className="headline mb-2">What we find</p>
                <ul className="footnote space-y-2 text-muted">
                  {["Delayed flights with unclaimed meals & hotel", "Cancelled bookings with pending refunds", "Baggage damage eligible for Montreal Convention", "Chargeback-ready denied boarding cases"].map((t) => (
                    <li key={t} className="flex items-start gap-2"><span className="mt-1 text-ok">✓</span> {t}</li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>

        {/* Hidden CSV file input */}
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={loadDemoAudit}
        />

        {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}

        <div className="mx-auto max-w-5xl px-4 pb-10">
          <ClientWall />
          <PartnerStrip />
        </div>

        {toast && (
          <div role="status" className="reveal fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#1d1d1f] px-5 py-2.5 text-[14px] text-white shadow-[var(--shadow-raised)]">
            {toast}
          </div>
        )}
      </>
    );

  return (
    <div className="reveal mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 px-1">
        <div>
          <p className="footnote text-muted">{corporate.company}</p>
          <h1 className="title-1 mt-0.5">PNR &amp; refund audit</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="caption rounded-full bg-accent-soft px-3 py-1.5 font-semibold text-accent">{corporate.plan}</span>
          <button className="btn-ghost" onClick={() => flash("Uploaded 214 PNRs from travel-desk-nov.csv")}><Upload size={15} aria-hidden /> Bulk upload</button>
          <button className="btn-primary" onClick={() => flash("Finance recovery report downloaded")}><Download size={15} aria-hidden /> Report</button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {corporate.kpis.map((k) => (
          <div key={k.label} className="card p-5">
            <div className="footnote text-muted">{k.label}</div>
            <div className="title-1 mt-1 tabular-nums">{k.value}</div>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3 px-1">
          <h2 className="title-2">Employee bookings with recoverable value</h2>
          <label className="relative">
            <Search size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" aria-hidden />
            <input className="field w-64! py-1.5! pl-8! text-[15px]!" placeholder="Search employee, PNR, flight" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search bookings" />
          </label>
        </div>
        <div className="card overflow-x-auto">
          <table className="footnote w-full min-w-[720px]">
            <thead className="caption text-left text-muted">
              <tr className="border-b border-line">
                <th className="px-5 py-3 font-medium">Employee</th>
                <th className="px-3 py-3 font-medium">PNR</th>
                <th className="px-3 py-3 font-medium">Flight</th>
                <th className="px-3 py-3 font-medium">Issue</th>
                <th className="px-3 py-3 text-right font-medium">Recoverable</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.pnr} className="border-b border-line last:border-0 hover:bg-surface-2">
                  <td className="px-5 py-3">
                    <div className="font-medium">{r.emp}</div>
                    <div className="caption text-muted">{r.dept}</div>
                  </td>
                  <td className="px-3 py-3 font-mono">{r.pnr}</td>
                  <td className="px-3 py-3">{r.flight}</td>
                  <td className="px-3 py-3 text-muted">{r.issue}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{r.amount ? inr(r.amount) : "-"}</td>
                  <td className="px-5 py-3">
                    <span className={`caption rounded-full px-2 py-0.5 font-semibold ${STATUS_TONE[r.status] ?? "bg-fill text-muted"}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted">No bookings match &ldquo;{q}&rdquo;.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <ClientWall />
      <PartnerStrip />
      <ClientStories />

      {toast && (
        <div role="status" className="reveal fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#1d1d1f] px-5 py-2.5 text-[14px] text-white shadow-[var(--shadow-raised)]">
          {toast}
        </div>
      )}
    </div>
  );
}

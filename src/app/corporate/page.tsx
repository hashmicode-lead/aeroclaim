"use client";

import { Download, FileSpreadsheet, Search, Upload, Users } from "lucide-react";
import { EmptyHome } from "@/components/EmptyHome";
import { useSession } from "@/components/session";
import { useMemo, useState } from "react";
import { corporate, inr } from "@/lib/demo";

const STATUS_TONE: Record<string, string> = {
  Settled: "bg-ok-soft text-ok",
  "Claim sent": "bg-info-soft text-info",
  "Chargeback ready": "bg-warn-soft text-warn",
  "Awaiting PIR": "bg-bad-soft text-bad",
  "Refund requested": "bg-info-soft text-info",
  "Meals only": "bg-fill text-muted",
};

export default function CorporatePage() {
  const session = useSession();
  const [q, setQ] = useState("");
  const [toast, setToast] = useState("");
  const rows = useMemo(
    () => corporate.rows.filter((r) => `${r.emp} ${r.dept} ${r.pnr} ${r.flight} ${r.issue}`.toLowerCase().includes(q.toLowerCase())),
    [q],
  );

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2200);
  };

  if (session?.isNew)
    return (
      <EmptyHome
        greeting={session.org || "Your company"}
        title="Set up your PNR audit"
        sub="Upload your travel desk's bookings and we'll find delayed, cancelled and unrefunded tickets."
        actions={[
          { href: "#", label: "Upload bookings (CSV or Excel)", desc: "PNR, employee, flight and fare columns. We match the rest.", Icon: FileSpreadsheet, primary: true },
          { href: "#", label: "Invite your team", desc: "Add finance and travel-desk colleagues.", Icon: Users },
        ]}
        checklist={["Create your business account", "Upload your first bookings file", "Invite a colleague", "Choose a plan (₹4,999/mo)"]}
      />
    );

  return (
    <div className="reveal mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 px-1">
        <div>
          <p className="footnote text-muted">{corporate.company}</p>
          <h1 className="title-1 mt-0.5">PNR & refund audit</h1>
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

      {toast && (
        <div role="status" className="reveal fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#1d1d1f] px-5 py-2.5 text-[14px] text-white shadow-[var(--shadow-raised)]">
          {toast}
        </div>
      )}
    </div>
  );
}

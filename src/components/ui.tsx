import type { FindingStatus } from "@/lib/types";

const STATUS: Record<FindingStatus, { label: string; cls: string }> = {
  eligible: { label: "Eligible", cls: "bg-ok-soft text-ok" },
  likely: { label: "Likely, contestable", cls: "bg-warn-soft text-warn" },
  needs_info: { label: "Needs info", cls: "bg-info-soft text-info" },
  not_eligible: { label: "Not eligible", cls: "bg-surface-2 text-muted" },
  info: { label: "Info", cls: "bg-surface-2 text-muted" },
};

export function StatusBadge({ status }: { status: FindingStatus }) {
  const s = STATUS[status];
  return <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

export function Section({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="text-base font-semibold">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

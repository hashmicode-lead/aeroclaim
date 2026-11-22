import type { FindingStatus } from "@/lib/types";

const STATUS: Record<FindingStatus, { label: string; cls: string }> = {
  eligible: { label: "Eligible", cls: "bg-ok-soft text-ok" },
  likely: { label: "Contestable", cls: "bg-warn-soft text-warn" },
  needs_info: { label: "Needs info", cls: "bg-info-soft text-info" },
  not_eligible: { label: "Not eligible", cls: "bg-fill text-muted" },
  info: { label: "Info", cls: "bg-fill text-muted" },
};

export function StatusBadge({ status }: { status: FindingStatus }) {
  const s = STATUS[status];
  return <span className={`caption inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 font-semibold ${s.cls}`}>{s.label}</span>;
}

/** Grouped section: title above, content in an inset card (iOS grouped-list style). */
export function Section({ title, aside, children, className = "" }: { title: string; aside?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={className}>
      <div className="mb-2 flex items-baseline justify-between gap-4 px-1">
        <h2 className="title-2">{title}</h2>
        {aside}
      </div>
      <div className="card p-5 sm:p-6">{children}</div>
    </section>
  );
}

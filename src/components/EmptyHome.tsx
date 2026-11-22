import { ArrowRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { InsuranceAd } from "./InsuranceAd";

/** First-run home for a freshly signed-up account: no history, clear next steps. */
export function EmptyHome({
  greeting,
  title,
  sub,
  actions,
  checklist,
}: {
  greeting: string;
  title: string;
  sub: string;
  actions: { href: string; label: string; desc: string; Icon: LucideIcon; primary?: boolean }[];
  checklist: string[];
}) {
  return (
    <div className="reveal mx-auto max-w-5xl px-4 py-10">
      <div className="px-1">
        <p className="footnote text-muted">{greeting}</p>
        <h1 className="title-1 mt-0.5">{title}</h1>
        <p className="mt-1.5 max-w-xl text-muted">{sub}</p>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {actions.map((a) => (
            <Link key={a.label} href={a.href} className={`pressable card group flex items-center gap-4 p-5 hover:bg-surface-2 ${a.primary ? "shadow-[inset_0_0_0_2px_var(--accent),var(--shadow-card)]" : ""}`}>
              <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${a.primary ? "bg-accent text-white" : "bg-accent-soft text-accent"}`}>
                <a.Icon size={20} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="headline block">{a.label}</span>
                <span className="footnote block text-muted">{a.desc}</span>
              </span>
              <ArrowRight size={16} className="text-muted transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          ))}

          <div className="card mt-6 px-6 py-10 text-center">
            <p className="headline">Nothing here yet</p>
            <p className="footnote mx-auto mt-1 max-w-sm text-muted">Your claims, deadlines and payouts will appear here once you add your first one.</p>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <p className="headline">Get set up</p>
            <ul className="mt-3 space-y-3">
              {checklist.map((c, i) => (
                <li key={c} className="footnote flex items-start gap-3">
                  <span className={`caption mt-px flex size-5 shrink-0 items-center justify-center rounded-full font-semibold ${i === 0 ? "bg-ok text-white" : "bg-fill text-muted"}`}>{i === 0 ? "✓" : i + 1}</span>
                  <span className={i === 0 ? "text-muted line-through" : ""}>{c}</span>
                </li>
              ))}
            </ul>
          </div>
          <InsuranceAd index={2} />
        </aside>
      </div>
    </div>
  );
}

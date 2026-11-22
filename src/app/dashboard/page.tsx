"use client";

import { ArrowRight, CalendarClock, CreditCard, FilePlus2, Plus } from "lucide-react";
import { EmptyHome } from "@/components/EmptyHome";
import Link from "next/link";
import { Countdown } from "@/components/client";
import { InsuranceAd } from "@/components/InsuranceAd";
import { useSession } from "@/components/session";
import { demoDeadlines, demoTotal, inr, myClaims, timeline } from "@/lib/demo";

const TONE = { info: "bg-info-soft text-info", ok: "bg-ok-soft text-ok", warn: "bg-warn-soft text-warn" };

export default function Dashboard() {
  const session = useSession();
  const first = session?.name?.split(" ")[0] ?? "there";
  const total = myClaims.reduce((s, c) => s + c.amount, 0);

  if (session?.isNew)
    return (
      <EmptyHome
        greeting="Welcome to AeroClaim"
        title={`Hi, ${first}`}
        sub="Add a flight that went wrong and we'll work out what you're owed."
        actions={[
          { href: "/claims/new", label: "Start your first claim", desc: "Delay, cancellation, denied boarding, baggage or a stuck refund.", Icon: FilePlus2, primary: true },
          { href: "/cards", label: "Check your card cover", desc: "See if your Wise or Naster card insures your trip.", Icon: CreditCard },
        ]}
        checklist={["Create your account", "Add your first flight", "Add a card for cover checks", "Add your UPI ID for payouts"]}
      />
    );

  return (
    <div className="reveal mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 px-1">
        <div>
          <p className="footnote text-muted">Welcome back</p>
          <h1 className="title-1 mt-0.5">Hi, {first}</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/cards" className="btn-ghost"><CreditCard size={16} aria-hidden /> Card cover</Link>
          <Link href="/claims/new" className="btn-primary"><Plus size={16} aria-hidden /> New claim</Link>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { k: "In progress", v: inr(total) },
          { k: "Recovered this year", v: inr(7500) },
          { k: "Next legal deadline", v: "26 Nov", sub: <Countdown due={demoDeadlines[0].due} /> },
        ].map((x) => (
          <div key={x.k} className="card p-5">
            <div className="footnote text-muted">{x.k}</div>
            <div className="title-1 mt-1 tabular-nums">{x.v}</div>
            {x.sub && <div className="footnote mt-0.5">{x.sub}</div>}
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <section>
          <h2 className="title-2 mb-2 px-1">Your claims</h2>
          <ul className="card divide-y divide-line overflow-hidden">
            {myClaims.map((c) => (
              <li key={c.id}>
                <Link href={c.id === "demo" ? "/audit/demo" : "#"} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-2 active:bg-fill">
                  <div className="min-w-0 flex-1">
                    <div className="headline truncate">{c.route}</div>
                    <div className="footnote truncate text-muted">{c.type} · {c.flight} · {c.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="headline tabular-nums">{inr(c.amount)}</div>
                    <span className={`caption rounded-full px-2 py-0.5 font-semibold ${TONE[c.tone]}`}>{c.status}</span>
                  </div>
                  <ArrowRight size={16} className="text-muted/50" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="title-2 mb-2 px-1">AI 161 · progress</h2>
          <div className="card p-5">
            <ol className="relative space-y-4">
              {timeline.map((t, i) => (
                <li key={t.label} className="relative flex gap-3">
                  {i < timeline.length - 1 && <span className={`absolute left-[9px] top-6 h-[calc(100%-4px)] w-0.5 ${t.done ? "bg-ok" : "bg-line"}`} aria-hidden />}
                  <span className={`relative z-10 mt-0.5 size-5 shrink-0 rounded-full border-2 ${t.done ? "border-ok bg-ok" : "border-line bg-surface"}`} aria-hidden />
                  <div>
                    <div className={`footnote font-medium ${t.done ? "" : "text-muted"}`}>{t.label}</div>
                    <div className="caption text-muted">{t.date}</div>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-fill px-3 py-2.5">
              <CalendarClock size={16} className="text-warn" aria-hidden />
              <span className="caption">Expected recovery {inr(demoTotal)}</span>
            </div>
          </div>
          <div className="mt-4">
            <InsuranceAd index={2} />
          </div>
        </section>
      </div>
    </div>
  );
}

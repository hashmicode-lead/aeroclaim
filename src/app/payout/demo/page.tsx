"use client";

import { Check, FileSignature, Lock, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SignaturePad } from "@/components/SignaturePad";
import { demoClaim, demoTotal, demoUser, feeModels, inr } from "@/lib/demo";
import { FEES } from "@/lib/pricing";

const DEMO_SCORE = 88;

type Track = "nowin" | "diy";

export default function PayoutPage() {
  const router = useRouter();
  const [track, setTrack] = useState<Track>("nowin");
  const [signed, setSigned] = useState(false);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);

  const ready = track === "diy" || (signed && agree);

  const options: { id: Track; title: string; price: string; youGet: number; points: string[]; Icon: typeof Wallet }[] = [
    {
      id: "nowin",
      title: "We file it for you*",
      price: `₹0 upfront · ${FEES.standardPct}% if we win`,
      youGet: feeModels.noWin.youGet,
      points: [`Offered because your claim scored ${DEMO_SCORE}/100`, "We send every notice and chase the airline, insurer and bank", `${FEES.escalatedPct}% only if it has to go to the consumer commission`, "Nothing to pay if you don't recover"],
      Icon: FileSignature,
    },
    {
      id: "diy",
      title: "Self-file kit",
      price: "₹299 one-time",
      youGet: demoTotal,
      points: ["All four filing packets, ready to send", "Step-by-step filing guide and deadline reminders", "The airline and insurer pay you directly. Keep 100%"],
      Icon: Wallet,
    },
  ];

  return (
    <div className="reveal mx-auto max-w-4xl px-4 py-8">
      <Link href="/audit/demo" className="footnote text-accent hover:underline">‹ Back to audit</Link>
      <header className="mt-5 px-1">
        <p className="eyebrow">Step 3 of 4</p>
        <h1 className="title-1 mt-2">How would you like to recover {inr(demoTotal)}?</h1>
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Payout track">
        {options.map((o) => {
          const on = track === o.id;
          return (
            <label
              key={o.id}
              className={`pressable card relative cursor-pointer p-6 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-accent-soft ${on ? "shadow-[inset_0_0_0_2px_var(--accent),var(--shadow-card)]" : ""}`}
            >
              <input type="radio" name="track" className="sr-only" checked={on} onChange={() => setTrack(o.id)} />
              <div className="flex items-start justify-between">
                <div className={`flex size-10 items-center justify-center rounded-xl ${on ? "bg-accent text-white" : "bg-fill text-ink"}`}>
                  <o.Icon size={20} aria-hidden />
                </div>
                <span className={`flex size-6 items-center justify-center rounded-full ${on ? "bg-accent text-white" : "ring-1 ring-line"}`}>
                  {on && <Check size={14} strokeWidth={3} aria-hidden />}
                </span>
              </div>
              <div className="headline mt-4">{o.title}</div>
              <div className="footnote text-muted">{o.price}</div>
              <div className="mt-4">
                <div className="caption text-muted">You receive</div>
                <div className="title-1 tabular-nums">{inr(o.youGet)}</div>
                {o.id === "nowin" && <div className="caption text-muted">Fee {inr(feeModels.noWin.fee)}, deducted only on success</div>}
                {o.id === "nowin" && (
                  <div className="mt-3">
                    <div className="caption flex justify-between text-muted"><span>Claim strength</span><span className="font-semibold text-ok">{DEMO_SCORE}/100</span></div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-fill"><div className="h-full rounded-full bg-ok" style={{ width: `${DEMO_SCORE}%` }} /></div>
                  </div>
                )}
              </div>
              <ul className="mt-4 space-y-2">
                {o.points.map((p) => (
                  <li key={p} className="footnote flex gap-2">
                    <Check size={16} className="mt-0.5 shrink-0 text-ok" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            </label>
          );
        })}
      </div>

      <p className="caption mt-3 px-1 text-muted">*No win, no fee is offered only after we check your claim&apos;s risk. Depending on that check, the fee can change (25% if a consumer-commission filing is needed), or we may offer the ₹299 self-file kit instead.</p>

      {track === "nowin" ? (
        <section key="loa" className="card reveal mt-6 p-6 sm:p-7">
          <h2 className="title-2">Digital Letter of Authority</h2>
          <p className="footnote mt-2 text-muted">
            I, <strong className="text-ink">{demoUser.name}</strong>, authorise AeroClaim OS to pursue compensation, refunds and insurance benefits for {demoClaim.airline} {demoClaim.flight} (PNR {demoClaim.pnr}) on my behalf. Amounts recovered will be paid to <strong className="text-ink">{demoUser.upi}</strong> after deducting a {FEES.standardPct}% success fee ({FEES.escalatedPct}% if a consumer-commission filing is needed). I can revoke this authority before AeroClaim files. If I withdraw after filing, or accept payment directly from the airline or insurer, I will pay AeroClaim its fee on that payment or ₹{FEES.withdrawalFee}, whichever is higher.
          </p>
          <div className="mt-5">
            <SignaturePad onChange={setSigned} />
          </div>
          <label className="footnote mt-3 flex cursor-pointer items-start gap-2.5">
            <input type="checkbox" className="mt-1 size-4 accent-[var(--accent)]" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            I agree to the Letter of Authority and consent to my data being processed for this claim (DPDP Act, 2023).
          </label>
        </section>
      ) : (
        <section key="kit" className="card reveal mt-6 flex flex-wrap items-center gap-4 p-6 sm:p-7">
          <div className="min-w-0 flex-1">
            <h2 className="title-2">Self-file kit</h2>
            <p className="footnote mt-1 text-muted">One payment of ₹299 by UPI or card. In this demo, no payment is taken.</p>
          </div>
          <div className="caption flex items-center gap-1.5 text-muted"><Lock size={13} aria-hidden /> Secured by Razorpay (demo)</div>
        </section>
      )}

      <div className="no-print sticky bottom-3 z-30 mt-6 flex items-center justify-between gap-4 rounded-2xl bg-surface px-4 py-3 shadow-[var(--shadow-raised)] ring-1 ring-line">
        <p className="footnote hidden text-muted sm:block">
          {track === "nowin" ? (ready ? "Signed. We'll take it from here." : "Sign and accept to continue.") : "Unlock all four packets for ₹299."}
        </p>
        <button
          className="btn-primary ml-auto px-6! py-2.5!"
          disabled={!ready || busy}
          onClick={() => {
            setBusy(true);
            setTimeout(() => router.push("/packets/demo"), 600);
          }}
        >
          {busy ? "Saving…" : track === "nowin" ? "Sign & continue" : "Pay ₹299 & unlock"}
        </button>
      </div>
    </div>
  );
}

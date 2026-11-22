"use client";

import { Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Audience = "travellers" | "business" | "advocates";

interface Plan {
  id: string;
  name: string;
  price: string;
  unit: string;
  blurb: string;
  features: string[];
  cta: string;
  featured?: boolean;
}

export const PLANS: Record<Audience, Plan[]> = {
  travellers: [
    {
      id: "nowin",
      name: "No win, no fee",
      price: "₹0",
      unit: "upfront · 15% on success",
      blurb: "We file and chase everything. You pay only from what you recover.",
      features: ["Airline, insurer and bank claims filed for you", "AirSewa and e-Jagriti escalation", "Payout straight to your UPI", "Digital Letter of Authority"],
      cta: "Start free",
      featured: true,
    },
    {
      id: "diy",
      name: "Self-file kit",
      price: "₹299",
      unit: "one-time, per claim",
      blurb: "Every packet ready to send. The airline pays you directly.",
      features: ["Four filing packets as PDF", "Step-by-step filing guide", "Deadline reminders by email", "Keep 100% of the payout"],
      cta: "Get the kit",
    },
  ],
  business: [
    {
      id: "corporate",
      name: "Corporate",
      price: "₹4,999",
      unit: "per month",
      blurb: "Audit every employee PNR and recover unused and delayed travel spend.",
      features: ["Unlimited PNR audits", "Bulk upload from your travel desk", "Refund and chargeback tracking", "Monthly finance recovery report"],
      cta: "Start 14-day trial",
      featured: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      unit: "annual contract",
      blurb: "For travel management companies and large travel desks.",
      features: ["SSO and role-based access", "API access to the rules engine", "Dedicated claims manager", "Custom success-fee terms"],
      cta: "Talk to sales",
    },
  ],
  advocates: [
    {
      id: "leads",
      name: "Pay per lead",
      price: "₹499–999",
      unit: "per verified case",
      blurb: "Evidence-checked case briefs for claims above ₹50,000.",
      features: ["Weather and rule checks done", "Full document bundle on unlock", "In-browser video consults", "No subscription"],
      cta: "Join as advocate",
      featured: true,
    },
    {
      id: "pro",
      name: "Advocate Pro",
      price: "₹2,499",
      unit: "per month",
      blurb: "First look at high-value leads in your city.",
      features: ["10 lead unlocks included", "Priority on leads over ₹1 lakh", "Calendar booking page", "Verified badge on your profile"],
      cta: "Go Pro",
    },
  ],
};

const LABEL: Record<Audience, string> = { travellers: "Travellers", business: "Business", advocates: "Advocates" };

/** Modal sheet. Dims the page, scales in from 96%, closes on Esc, scrim click or the close button. */
export function PricingModal({
  open,
  onClose,
  onChoose,
  initial = "travellers",
  title = "Plans & pricing",
}: {
  open: boolean;
  onClose: () => void;
  onChoose?: (plan: Plan) => void;
  initial?: Audience;
  title?: string;
}) {
  const [audience, setAudience] = useState<Audience>(initial);
  const [closing, setClosing] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);

  const close = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, reduce ? 0 : 180);
  };

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>("button, [href], input");
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      (opener.current as HTMLElement | null)?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="presentation">
      <div className={`scrim absolute inset-0 bg-black/35 ${closing ? "scrim-out" : ""}`} onClick={close} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pricing-title"
        tabIndex={-1}
        className={`sheet relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-bg p-6 shadow-[var(--shadow-raised)] outline-none sm:rounded-3xl sm:p-8 ${closing ? "sheet-out" : ""}`}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-line sm:hidden" aria-hidden />
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="pricing-title" className="title-1">{title}</h2>
            <p className="footnote mt-1 text-muted">No card needed to start. Switch plans any time.</p>
          </div>
          <button onClick={close} aria-label="Close" className="pressable flex size-8 shrink-0 items-center justify-center rounded-full bg-fill text-muted hover:text-ink">
            <X size={16} aria-hidden />
          </button>
        </div>

        <div className="segmented mt-6" role="radiogroup" aria-label="Plans for">
          {(Object.keys(PLANS) as Audience[]).map((a) => (
            <label key={a} data-on={audience === a}>
              <input type="radio" name="audience" className="sr-only" checked={audience === a} onChange={() => setAudience(a)} />
              {LABEL[a]}
            </label>
          ))}
        </div>

        <div key={audience} className="reveal mt-5 grid gap-3 sm:grid-cols-2">
          {PLANS[audience].map((p) => (
            <div key={p.id} className={`card flex flex-col p-6 ${p.featured ? "shadow-[inset_0_0_0_2px_var(--accent),var(--shadow-card)]" : ""}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="headline">{p.name}</span>
                {p.featured && <span className="caption rounded-full bg-accent px-2 py-0.5 font-semibold text-white">Most popular</span>}
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="title-1 tabular-nums">{p.price}</span>
                <span className="footnote text-muted">{p.unit}</span>
              </div>
              <p className="footnote mt-2 text-muted">{p.blurb}</p>
              <ul className="mt-4 flex-1 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="footnote flex gap-2">
                    <Check size={16} className="mt-0.5 shrink-0 text-ok" aria-hidden /> {f}
                  </li>
                ))}
              </ul>
              <button
                className={`${p.featured ? "btn-primary" : "btn-ghost"} mt-6 w-full py-2.5!`}
                onClick={() => {
                  onChoose?.(p);
                  close();
                }}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
        <p className="caption mt-5 text-center text-muted">Prices include GST. Demo build: no payment is taken.</p>
      </div>
    </div>
  );
}

"use client";

import { BadgeCheck, CalendarDays, Check, Clock, Lock, MapPin, ShieldCheck, Unlock, X } from "lucide-react";
import { useSession, signIn } from "@/components/session";
import Link from "next/link";
import { useState } from "react";
import { inr, leads } from "@/lib/demo";

const SLOTS = [
  { time: "Today, 4:30 pm", who: "Ananya Sharma · AI 161", live: true },
  { time: "Tomorrow, 11:00 am", who: "Vikram Joshi · 6E 2041", live: false },
  { time: "Thu, 3:00 pm", who: "Fatima Sheikh · UK 811", live: false },
];

function ProfileModal({ onClose, onSave }: { onClose: () => void; onSave: (profile: { name: string; city: string; fee: string }) => void }) {
  const session = useSession();
  const [name, setName] = useState(session?.name ?? "Adv. Rahul Khanna");
  const [city, setCity] = useState("Delhi NCR");
  const [fee, setFee] = useState("999");
  const [practice, setPractice] = useState("Consumer Commission, Aviation Disputes");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="reveal card w-full max-w-md p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="title-2">Complete advocate profile</h2>
          <button onClick={onClose} className="text-muted hover:text-ink" aria-label="Close"><X size={18} /></button>
        </div>
        <p className="footnote mb-4 text-muted">Complete your details to finish Bar Council verification and receive verified consumer briefs.</p>
        <div className="space-y-3">
          <div>
            <label className="label">Advocate full name</label>
            <input className="field mt-1" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">Jurisdiction / City</label>
            <input className="field mt-1" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div>
            <label className="label">Practice areas</label>
            <input className="field mt-1" value={practice} onChange={(e) => setPractice(e.target.value)} />
          </div>
          <div>
            <label className="label">Video consultation fee (₹)</label>
            <input className="field mt-1" type="number" value={fee} onChange={(e) => setFee(e.target.value)} />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button className="btn-primary" onClick={() => onSave({ name, city, fee })}>
            Save &amp; activate portal
          </button>
        </div>
      </div>
    </div>
  );
}

function AvailabilityModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [slots, setSlots] = useState(["10:00 AM - 1:00 PM", "3:00 PM - 6:00 PM"]);
  const allSlots = ["9:00 AM - 12:00 PM", "10:00 AM - 1:00 PM", "2:00 PM - 5:00 PM", "3:00 PM - 6:00 PM", "6:00 PM - 8:00 PM"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="reveal card w-full max-w-md p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="title-2">Set consult availability</h2>
          <button onClick={onClose} className="text-muted hover:text-ink" aria-label="Close"><X size={18} /></button>
        </div>
        <p className="footnote mb-4 text-muted">Choose the time slots when travellers with claims &gt;₹50,000 can book direct video consults.</p>
        <div className="space-y-2">
          {allSlots.map((s) => {
            const active = slots.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSlots((prev) => active ? prev.filter((x) => x !== s) : [...prev, s])}
                className={`flex w-full items-center justify-between rounded-xl border p-3 text-sm transition-colors ${active ? "border-accent bg-accent-soft text-accent font-medium" : "border-line bg-surface hover:bg-surface-2"}`}
              >
                <span>{s}</span>
                {active && <Check size={16} />}
              </button>
            );
          })}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button className="btn-primary" onClick={onSave}>Save availability</button>
        </div>
      </div>
    </div>
  );
}

export default function AdvocatePortal() {
  const session = useSession();
  const [unlocked, setUnlocked] = useState<Record<string, boolean>>({ "L-2291": true });
  const [showProfile, setShowProfile] = useState(false);
  const [showAvail, setShowAvail] = useState(false);
  const spent = leads.filter((l) => unlocked[l.id]).reduce((s, l) => s + l.fee, 0);

  const advocateName = session?.name || "Adv. Rahul Khanna";

  function activatePortal(updatedName?: string) {
    signIn({
      name: updatedName ?? session?.name ?? "Adv. Rahul Khanna",
      email: session?.email ?? "advocate@lawchambers.in",
      role: "advocate",
      isNew: false,
    });
  }

  if (session?.isNew)
    return (
      <div className="reveal mx-auto max-w-5xl px-4 py-10">
        <div className="px-1">
          <p className="footnote text-muted">Consumer Advocate Portal</p>
          <h1 className="title-1 mt-0.5">Verification in progress</h1>
          <p className="mt-1.5 max-w-xl text-muted">We&apos;re confirming your enrolment with the Bar Council. Leads appear here once you&apos;re verified, usually within one working day.</p>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowProfile(true)}
              className="pressable card group flex w-full items-center gap-4 p-5 text-left hover:bg-surface-2 shadow-[inset_0_0_0_2px_var(--accent),var(--shadow-card)]"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-white"><BadgeCheck size={20} /></span>
              <span className="min-w-0 flex-1">
                <span className="headline block">Complete your profile</span>
                <span className="footnote block text-muted">Practice areas, city and consultation fee.</span>
              </span>
              <span className="text-muted">→</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAvail(true)}
              className="pressable card group flex w-full items-center gap-4 p-5 text-left hover:bg-surface-2"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"><Clock size={20} /></span>
              <span className="min-w-0 flex-1">
                <span className="headline block">Set your availability</span>
                <span className="footnote block text-muted">Slots travellers can book for video consults.</span>
              </span>
              <span className="text-muted">→</span>
            </button>
            <div className="card mt-6 px-6 py-10 text-center">
              <p className="headline">Leads appear after verification</p>
              <p className="footnote mx-auto mt-1 max-w-sm text-muted">Pre-audited consumer dispute briefs (&gt;₹50,000) with verified evidence appear here once Bar Council confirmation is complete.</p>
              <button
                type="button"
                className="btn-ghost mt-4"
                onClick={() => activatePortal()}
              >
                Preview demo leads
              </button>
            </div>
          </div>
          <aside className="space-y-4">
            <div className="card p-5">
              <p className="headline">Verification checklist</p>
              <ul className="mt-3 space-y-3">
                {["Create your advocate account", "Bar Council verification", "Complete your profile", "Unlock your first lead"].map((c, i) => (
                  <li key={c} className="footnote flex items-start gap-3">
                    <span className={`caption mt-px flex size-5 shrink-0 items-center justify-center rounded-full font-semibold ${i === 0 ? "bg-ok text-white" : "bg-fill text-muted"}`}>
                      {i === 0 ? "✓" : i + 1}
                    </span>
                    <span className={i === 0 ? "text-muted line-through" : ""}>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {showProfile && (
          <ProfileModal
            onClose={() => setShowProfile(false)}
            onSave={({ name }) => {
              setShowProfile(false);
              activatePortal(name);
            }}
          />
        )}

        {showAvail && (
          <AvailabilityModal
            onClose={() => setShowAvail(false)}
            onSave={() => {
              setShowAvail(false);
              activatePortal();
            }}
          />
        )}
      </div>
    );

  return (
    <div className="reveal mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 px-1">
        <div>
          <p className="footnote text-muted">Consumer Advocate Portal</p>
          <h1 className="title-1 mt-0.5">Verified case leads</h1>
        </div>
        <span className="caption inline-flex items-center gap-1.5 rounded-full bg-ok-soft px-3 py-1.5 font-semibold text-ok">
          <ShieldCheck size={14} aria-hidden /> Bar Council verified · {advocateName}
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { k: "Open leads near you", v: String(leads.length) },
          { k: "Lead spend this month", v: inr(spent) },
          { k: "Avg. claim value", v: inr(Math.round(leads.reduce((s, l) => s + l.value, 0) / leads.length)) },
        ].map((x) => (
          <div key={x.k} className="card p-5">
            <div className="footnote text-muted">{x.k}</div>
            <div className="title-1 mt-1 tabular-nums">{x.v}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_300px]">
        <section>
          <h2 className="title-2 mb-2 px-1">New leads</h2>
          <ul className="space-y-3">
            {leads.map((l) => {
              const open = unlocked[l.id];
              return (
                <li key={l.id} className="card p-5">
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="headline">{l.title}</span>
                        {l.verified && <span className="caption rounded-full bg-ok-soft px-2 py-0.5 font-semibold text-ok">Evidence verified</span>}
                      </div>
                      <div className="footnote mt-1 flex flex-wrap gap-x-4 text-muted">
                        <span>{l.route}</span>
                        <span className="inline-flex items-center gap-1"><MapPin size={12} aria-hidden />{l.city}</span>
                        <span>{l.age}</span>
                      </div>
                      {open ? (
                        <p className="footnote reveal mt-3 rounded-xl bg-fill p-3">
                          Client contact and the full brief (weather certificate, PIR, receipts) are unlocked.
                          {l.id === "L-2291" && <> <Link href="/advocate/demo" className="text-accent hover:underline">Join scheduled call ›</Link></>}
                        </p>
                      ) : (
                        <p className="footnote mt-3 text-muted">Name, contact and documents are hidden until you unlock this lead.</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="caption text-muted">Claim value</div>
                      <div className="headline tabular-nums">{inr(l.value)}</div>
                      <button
                        className={`${open ? "btn-ghost" : "btn-primary"} mt-3`}
                        disabled={open}
                        onClick={() => setUnlocked((u) => ({ ...u, [l.id]: true }))}
                      >
                        {open ? <><Unlock size={14} aria-hidden /> Unlocked</> : <><Lock size={14} aria-hidden /> Unlock {inr(l.fee)}</>}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h2 className="title-2 mb-2 px-1">Schedule</h2>
          <div className="card divide-y divide-line">
            {SLOTS.map((s) => (
              <div key={s.time} className="flex items-center gap-3 p-4">
                <CalendarDays size={18} className={s.live ? "text-accent" : "text-muted"} aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="footnote font-medium">{s.time}</div>
                  <div className="caption truncate text-muted">{s.who}</div>
                </div>
                {s.live && <Link href="/advocate/demo" className="btn-primary px-3! py-1! text-[13px]!">Join</Link>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

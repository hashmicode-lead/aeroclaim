"use client";

import { CheckCircle2, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";

const TOPICS = ["A claim I've filed", "Business plans", "Advocate partnership", "Press", "Something else"];

export default function ContactPage() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [err, setErr] = useState("");

  return (
    <div className="reveal mx-auto grid max-w-5xl gap-10 px-4 py-16 lg:grid-cols-[1fr_320px]">
      <div>
        <p className="eyebrow">Contact</p>
        <h1 className="title-1 mt-2">How can we help?</h1>
        <p className="mt-2 text-muted">We reply within one working day.</p>

        {sent ? (
          <div className="card reveal mt-8 flex items-start gap-4 p-6">
            <CheckCircle2 size={24} className="shrink-0 text-ok" aria-hidden />
            <div>
              <p className="headline">Message sent</p>
              <p className="footnote mt-1 text-muted">Thanks, {form.name.split(" ")[0]}. We&apos;ll reply to {form.email} within one working day.</p>
            </div>
          </div>
        ) : (
          <form
            className="card mt-8 space-y-4 p-6 sm:p-7"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.name.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) || form.message.trim().length < 10) {
                setErr("Add your name, a valid email and a message of at least 10 characters.");
                return;
              }
              setErr("");
              setSent(true);
            }}
          >
            <fieldset>
              <legend className="label">Topic</legend>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((t) => (
                  <button key={t} type="button" onClick={() => setTopic(t)} className={`pressable rounded-full px-3.5 py-1.5 text-[14px] ${topic === t ? "bg-accent text-white" : "bg-fill hover:bg-surface-2"}`}>{t}</button>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="cn" className="label">Name</label>
                <input id="cn" className="field" autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label htmlFor="ce" className="label">Email</label>
                <input id="ce" type="email" className="field" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div>
              <label htmlFor="cm" className="label">Message</label>
              <textarea id="cm" rows={5} className="field" placeholder="Include your claim reference if you have one." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
            {err && <p className="footnote text-bad" role="alert">{err}</p>}
            <button type="submit" className="btn-primary px-6! py-2.5!">Send message</button>
          </form>
        )}
      </div>

      <aside className="card h-fit space-y-5 p-6 lg:mt-24">
        {[
          { Icon: Mail, t: "Email", d: "support@aeroclaim.example" },
          { Icon: Phone, t: "Phone", d: "+91 80 4000 0000 · Mon–Sat, 9am–7pm" },
          { Icon: MapPin, t: "Office", d: "AeroClaim Technologies Pvt Ltd, Indiranagar, Bengaluru 560038" },
        ].map(({ Icon, t, d }) => (
          <div key={t} className="flex gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"><Icon size={17} aria-hidden /></span>
            <div>
              <div className="footnote font-semibold">{t}</div>
              <div className="footnote select-all text-muted">{d}</div>
            </div>
          </div>
        ))}
        <p className="caption border-t border-line pt-4 text-muted">Grievance Officer under the IT Rules, 2021: grievance@aeroclaim.example. We acknowledge within 24 hours and resolve within 15 days.</p>
      </aside>
    </div>
  );
}

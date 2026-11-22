"use client";

import { Briefcase, Plane, Scale } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { InsuranceAd } from "@/components/InsuranceAd";
import { LogoMark } from "@/components/Logo";
import { PricingModal } from "@/components/PricingModal";
import { ROLE_HOME, signIn, type Role } from "@/components/session";

const ROLES: { id: Role; title: string; desc: string; Icon: typeof Plane; audience: "travellers" | "business" | "advocates" }[] = [
  { id: "flyer", title: "Traveller", desc: "Claim for my own flights", Icon: Plane, audience: "travellers" },
  { id: "corporate", title: "Business", desc: "Audit my company's travel", Icon: Briefcase, audience: "business" },
  { id: "advocate", title: "Advocate", desc: "Take on verified cases", Icon: Scale, audience: "advocates" },
];

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("flyer");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", org: "", enrolment: "" });
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pricing, setPricing] = useState<"browse" | "choose" | null>(null);
  const [plan, setPlan] = useState<string | null>(null);

  const audience = ROLES.find((r) => r.id === role)!.audience;
  const bind = (k: keyof typeof form) => ({
    id: k,
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value })),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!form.name.trim()) err.name = "Enter your full name";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) err.email = "Enter a valid email";
    if (form.password.length < 8) err.password = "Use at least 8 characters";
    if (role === "corporate" && !form.org.trim()) err.org = "Enter your company name";
    if (role === "advocate" && !/^[A-Z]{1,3}\/\d{1,5}\/\d{4}$/i.test(form.enrolment.trim())) err.enrolment = "Enter your enrolment number, e.g. D/1842/2014";
    if (!agree) err.agree = "Accept the terms to continue";
    setErrors(err);
    if (Object.keys(err).length) {
      document.getElementById(Object.keys(err)[0])?.focus();
      return;
    }
    signIn({ name: form.name.trim(), email: form.email.trim(), role, isNew: true, org: role === "corporate" ? form.org.trim() : undefined });
    setPricing("choose");
  }

  const strength = form.password.length === 0 ? 0 : form.password.length < 8 ? 1 : /[0-9]/.test(form.password) && /[A-Z]/.test(form.password) ? 3 : 2;

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 lg:grid-cols-[1fr_340px]">
      <div className="reveal mx-auto w-full max-w-lg">
        <LogoMark size={48} className="mb-5 drop-shadow-[0_6px_14px_rgba(0,88,184,0.25)]" />
        <h1 className="title-1">Create your account</h1>
        <p className="mt-1.5 text-muted">
          Already have one? <Link href="/login" className="text-accent hover:underline">Sign in</Link>
        </p>

        <form onSubmit={submit} noValidate className="mt-8 space-y-6">
          <fieldset>
            <legend className="label">I&apos;m signing up as</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {ROLES.map((r) => {
                const on = role === r.id;
                return (
                  <label key={r.id} className={`pressable cursor-pointer rounded-2xl p-4 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-accent-soft ${on ? "bg-accent-soft shadow-[inset_0_0_0_2px_var(--accent)]" : "bg-surface shadow-[var(--shadow-card)] hover:bg-surface-2"}`}>
                    <input type="radio" name="role" className="sr-only" checked={on} onChange={() => setRole(r.id)} />
                    <r.Icon size={20} className={on ? "text-accent" : "text-muted"} aria-hidden />
                    <span className={`headline mt-3 block ${on ? "text-accent" : ""}`}>{r.title}</span>
                    <span className="caption block text-muted">{r.desc}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="card space-y-4 p-6">
            <button type="button" className="btn w-full border border-line bg-surface py-2.5! text-ink hover:bg-surface-2" onClick={() => { signIn({ name: "New member", email: "you@gmail.com", role, isNew: true }); setPricing("choose"); }}>
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
              </svg>
              Sign up with Google
            </button>
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-line" />
              <span className="caption text-muted">or with email</span>
              <div className="h-px flex-1 bg-line" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="label">Full name</label>
                <input className="field" autoComplete="name" placeholder="Ananya Sharma" {...bind("name")} />
                {errors.name && <p className="footnote mt-1 text-bad">{errors.name}</p>}
              </div>
              {role === "corporate" && (
                <div className="sm:col-span-2">
                  <label htmlFor="org" className="label">Company name</label>
                  <input className="field" autoComplete="organization" placeholder="Northwind Analytics Pvt Ltd" {...bind("org")} />
                  {errors.org && <p className="footnote mt-1 text-bad">{errors.org}</p>}
                </div>
              )}
              {role === "advocate" && (
                <div className="sm:col-span-2">
                  <label htmlFor="enrolment" className="label">Bar Council enrolment number</label>
                  <input className="field uppercase" placeholder="D/1842/2014" {...bind("enrolment")} />
                  {errors.enrolment && <p className="footnote mt-1 text-bad">{errors.enrolment}</p>}
                </div>
              )}
              <div>
                <label htmlFor="email" className="label">{role === "corporate" ? "Work email" : "Email"}</label>
                <input type="email" className="field" autoComplete="email" placeholder="you@example.com" {...bind("email")} />
                {errors.email && <p className="footnote mt-1 text-bad">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="phone" className="label">Mobile (for deadline alerts)</label>
                <input type="tel" className="field" autoComplete="tel" placeholder="+91 98765 43210" {...bind("phone")} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="password" className="label">Password</label>
                <input type="password" className="field" autoComplete="new-password" placeholder="At least 8 characters" {...bind("password")} />
                <div className="mt-2 flex gap-1" aria-hidden>
                  {[1, 2, 3].map((n) => (
                    <span key={n} className={`h-1 flex-1 rounded-full transition-colors ${strength >= n ? (strength === 1 ? "bg-bad" : strength === 2 ? "bg-warn" : "bg-ok") : "bg-fill"}`} />
                  ))}
                </div>
                <p className={`footnote mt-1 ${errors.password ? "text-bad" : "text-muted"}`}>
                  {errors.password ?? (strength === 3 ? "Strong password" : strength === 2 ? "Add a number and a capital letter to make it stronger" : "Use at least 8 characters")}
                </p>
              </div>
            </div>
            <label className="footnote flex cursor-pointer items-start gap-2.5">
              <input id="agree" type="checkbox" className="mt-1 size-4 accent-[var(--accent)]" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>I agree to the Terms and Privacy Policy, and consent to my data being processed under the DPDP Act, 2023.</span>
            </label>
            {errors.agree && <p className="footnote -mt-2 text-bad">{errors.agree}</p>}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button type="button" className="footnote inline-flex items-center gap-1.5 text-accent hover:underline" onClick={() => setPricing("browse")}>
              See plans &amp; pricing
            </button>
            <button type="submit" className="btn-primary px-6! py-2.5!">Create account</button>
          </div>
          {plan && <p className="footnote text-ok">Plan selected: {plan}</p>}
        </form>
      </div>

      <aside className="space-y-4 lg:pt-16" aria-label="Sponsored">
        <InsuranceAd index={0} />
        <InsuranceAd index={1} />
      </aside>

      <PricingModal
        open={pricing !== null}
        initial={audience}
        title={pricing === "choose" ? "Choose your plan" : "Plans & pricing"}
        onClose={() => {
          const wasChoosing = pricing === "choose";
          setPricing(null);
          if (wasChoosing) router.push(ROLE_HOME[role]);
        }}
        onChoose={(p) => setPlan(p.name)}
      />
    </div>
  );
}

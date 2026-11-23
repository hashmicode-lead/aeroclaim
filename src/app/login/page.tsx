"use client";

import { Briefcase, Plane, Scale, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogoMark } from "@/components/Logo";
import { ROLE_HOME, signIn, type Role } from "@/components/session";

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function MicrosoftMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 23 23" aria-hidden>
      <path fill="#f35325" d="M1 1h10v10H1z" /><path fill="#81bc06" d="M12 1h10v10H12z" /><path fill="#05a6f0" d="M1 12h10v10H1z" /><path fill="#ffba08" d="M12 12h10v10H12z" />
    </svg>
  );
}

const TABS: { id: Role; label: string; Icon: typeof Plane; title: string; sub: string; emailPlaceholder: string }[] = [
  { id: "flyer", label: "Traveller", Icon: Plane, title: "Welcome back", sub: "Track your claims, deadlines and payouts.", emailPlaceholder: "ananya@example.com" },
  { id: "corporate", label: "Business", Icon: Briefcase, title: "Business sign in", sub: "For travel desks and finance teams.", emailPlaceholder: "you@company.com" },
  { id: "advocate", label: "Advocate", Icon: Scale, title: "Advocate portal", sub: "For advocates enrolled with a State Bar Council.", emailPlaceholder: "advocate@lawchambers.in" },
];

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("flyer");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [extra, setExtra] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const tab = TABS.find((t) => t.id === role)!;

  function finish(name: string, email: string, org?: string) {
    signIn({ name, email, role, isNew: false, org });
    router.push(ROLE_HOME[role]);
  }

  function sso(provider: string) {
    setBusy(provider);
    const people: Record<Role, [string, string, string?]> = {
      flyer: ["Ananya Sharma", "ananya.sharma@gmail.com"],
      corporate: ["Rohan Mehta", "rohan.mehta@northwind.in", "Northwind Analytics Pvt Ltd"],
      advocate: ["Adv. Rahul Khanna", "rahul.khanna@lawchambers.in"],
    };
    setTimeout(() => finish(...people[role]), 700);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!id.trim() || password.length < 4) return setError("Enter your email and password.");
    if (role === "corporate" && !/@/.test(id)) return setError("Use your work email address.");
    if (role === "advocate" && !/^[A-Z]{1,3}\/\d{1,5}\/\d{4}$/i.test(extra.trim())) return setError("Enter your enrolment number, e.g. D/1842/2014.");
    setError("");
    setBusy("form");
    const name = id.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    setTimeout(() => finish(role === "advocate" ? `Adv. ${name}` : name, id.includes("@") ? id : `${id}@aeroclaim.demo`, role === "corporate" ? (extra.trim() || "Your company") : undefined), 500);
  }

  return (
    <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex items-center gap-2" aria-label="AeroClaim home">
          <LogoMark size={28} />
          <span className="headline text-ink">AeroClaim</span>
        </Link>
        <div className="segmented mx-auto flex! w-full" role="tablist" aria-label="Account type">
          {TABS.map((t) => (
            <label key={t.id} data-on={role === t.id} className="flex-1 inline-flex items-center justify-center gap-1.5">
              <input type="radio" name="acct" className="sr-only" checked={role === t.id} onChange={() => { setRole(t.id); setError(""); setExtra(""); }} />
              <t.Icon size={14} aria-hidden /> {t.label}
            </label>
          ))}
        </div>

        <div key={role} className="reveal">
          <div className="mt-8 text-center">
            <LogoMark size={52} className="mx-auto" />
            <h1 className="title-1 mt-5">{tab.title}</h1>
            <p className="footnote mt-1.5 text-muted">{tab.sub}</p>
          </div>

          <div className="card mt-8 p-6">
            {role !== "advocate" && (
              <>
                <div className="space-y-2">
                  <button type="button" className="btn w-full border border-line bg-surface py-2.5! text-ink hover:bg-surface-2" disabled={busy !== null} onClick={() => sso("google")}>
                    <GoogleMark /> {busy === "google" ? "Connecting…" : role === "corporate" ? "Continue with Google Workspace" : "Continue with Google"}
                  </button>
                  {role === "corporate" && (
                    <button type="button" className="btn w-full border border-line bg-surface py-2.5! text-ink hover:bg-surface-2" disabled={busy !== null} onClick={() => sso("microsoft")}>
                      <MicrosoftMark /> {busy === "microsoft" ? "Connecting…" : "Continue with Microsoft"}
                    </button>
                  )}
                </div>
                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-line" />
                  <span className="caption text-muted">or</span>
                  <div className="h-px flex-1 bg-line" />
                </div>
              </>
            )}

            <form className="space-y-3" onSubmit={submit} noValidate>
              {role === "advocate" && (
                <div>
                  <label htmlFor="extra" className="label">Bar Council enrolment number</label>
                  <input id="extra" className="field uppercase" value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="D/1842/2014" />
                </div>
              )}
              <div>
                <label htmlFor="id" className="label">{role === "corporate" ? "Work email" : role === "advocate" ? "Email" : "Email or username"}</label>
                <input id="id" className="field" autoComplete="username" value={id} onChange={(e) => setId(e.target.value)} placeholder={tab.emailPlaceholder} />
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <label htmlFor="password" className="label">Password</label>
                  <button type="button" className="caption text-accent hover:underline">Forgot?</button>
                </div>
                <div className="relative">
                <input id="password" type="password" className="field pr-10!" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink" onClick={(e) => { const inp = (e.currentTarget.previousElementSibling as HTMLInputElement); inp.type = inp.type === "password" ? "text" : "password"; }} aria-label="Show or hide password">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                </div>
              </div>
              {role === "corporate" && (
                <div>
                  <label htmlFor="extra" className="label">Company <span className="font-normal text-muted">(optional)</span></label>
                  <input id="extra" className="field" value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Northwind Analytics Pvt Ltd" />
                </div>
              )}
              {error && <p className="footnote text-bad" role="alert">{error}</p>}
              <button type="submit" className="btn-primary w-full py-2.5!" disabled={busy !== null}>
                {busy === "form" ? "Signing in…" : "Sign in"}
              </button>
            </form>

            {role === "advocate" && (
              <p className="caption mt-4 flex items-start gap-1.5 text-muted">
                <ShieldCheck size={14} className="mt-px shrink-0 text-ok" aria-hidden /> We verify every enrolment with the issuing Bar Council before leads are shown.
              </p>
            )}
          </div>

          <p className="footnote mt-6 text-center text-muted">
            New to AeroClaim? <Link href="/signup" className="text-accent hover:underline">Create an account</Link>
          </p>
          <p className="caption mt-2 text-center text-muted">Demo build: any email and password will work.</p>
        </div>
      </div>
    </div>
  );
}

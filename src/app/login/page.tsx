"use client";

import { Plane } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "@/components/session";

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

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState<"google" | "form" | null>(null);
  const [error, setError] = useState("");

  function finish(n: string, email: string) {
    signIn({ name: n, email, role: "flyer" });
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center px-4 py-12">
      <div className="reveal w-full max-w-sm">
        <div className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-accent text-white shadow-[var(--shadow-card)]">
            <Plane size={24} strokeWidth={2.25} aria-hidden />
          </div>
          <h1 className="title-1 mt-5">{mode === "signin" ? "Sign in to AeroClaim" : "Create your account"}</h1>
          <p className="footnote mt-1.5 text-muted">Track claims, deadlines and payouts in one place.</p>
        </div>

        <div className="card mt-8 p-6">
          <button
            type="button"
            className="btn w-full border border-line bg-surface py-2.5! text-ink hover:bg-surface-2"
            disabled={busy !== null}
            onClick={() => {
              setBusy("google");
              setTimeout(() => finish("Ananya Sharma", "ananya.sharma@gmail.com"), 700);
            }}
          >
            <GoogleMark />
            {busy === "google" ? "Connecting to Google…" : "Continue with Google"}
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="caption text-muted">or</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!username.trim() || password.length < 4) {
                setError("Enter a username and a password of at least 4 characters.");
                return;
              }
              setError("");
              setBusy("form");
              const display = mode === "signup" && name.trim() ? name.trim() : username.trim().replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
              setTimeout(() => finish(display, username.includes("@") ? username : `${username.trim()}@aeroclaim.demo`), 500);
            }}
          >
            {mode === "signup" && (
              <div>
                <label htmlFor="name" className="label">Full name</label>
                <input id="name" className="field" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ananya Sharma" />
              </div>
            )}
            <div>
              <label htmlFor="username" className="label">Username or email</label>
              <input id="username" className="field" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ananya" />
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input id="password" type="password" className="field" autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            {error && <p className="footnote text-bad">{error}</p>}
            <button type="submit" className="btn-primary w-full py-2.5!" disabled={busy !== null}>
              {busy === "form" ? "Signing in…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>
        </div>

        <p className="footnote mt-6 text-center text-muted">
          {mode === "signin" ? "New to AeroClaim? " : "Already have an account? "}
          <button className="text-accent hover:underline" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}>
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
        <p className="caption mt-3 text-center text-muted">
          Demo build: any username and password will work. <Link href="/demo" className="text-accent hover:underline">Skip to the live demo</Link>
        </p>
      </div>
    </div>
  );
}

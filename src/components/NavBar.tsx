"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { PricingModal } from "./PricingModal";
import { ROLE_HOME, ROLE_LABEL, setRole, signOut, useSession, type Role } from "./session";

const LINKS: Record<Role, { href: string; label: string }[]> = {
  flyer: [
    { href: "/dashboard", label: "My claims" },
    { href: "/claims/new", label: "New claim" },
    { href: "/cards", label: "Card cover" },
  ],
  corporate: [{ href: "/corporate", label: "PNR audit" }],
  advocate: [{ href: "/advocate", label: "Leads" }],
};

function ActiveLinks({ role }: { role: Role }) {
  const path = usePathname();
  return <NavLinksInner role={role} path={path} />;
}

function NavLinksInner({ role, path }: { role: Role; path: string }) {
  return (
    <>
      {LINKS[role].map((l) => (
        <Link key={l.href} href={l.href} className={`rounded-full px-3 py-1.5 transition-colors ${path.startsWith(l.href) ? "text-ink" : "text-ink/60 hover:text-ink"}`}>
          {l.label}
        </Link>
      ))}
    </>
  );
}

export function NavBar() {
  const session = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pricing, setPricing] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const role: Role = session?.role ?? "flyer";

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !menu.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <>
    <header className="no-print sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-12 max-w-5xl items-center gap-4 px-4">
        <Link href="/" aria-label="AeroClaim home" className="flex items-center">
          <Logo size={26} />
        </Link>

        {session && (
          <nav className="hidden items-center gap-1 text-[13px] sm:flex">
            <Suspense fallback={<NavLinksInner role={role} path="" />}>
              <ActiveLinks role={role} />
            </Suspense>
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2">
          {session && (
            <div className="segmented hidden md:inline-flex" role="radiogroup" aria-label="Switch workspace">
              {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                <label key={r} data-on={role === r} className="min-w-0! px-3! py-1! text-[12px]!">
                  <input
                    type="radio"
                    name="role"
                    className="sr-only"
                    checked={role === r}
                    onChange={() => {
                      setRole(r);
                      router.push(ROLE_HOME[r]);
                    }}
                  />
                  {ROLE_LABEL[r]}
                </label>
              ))}
            </div>
          )}

          {session === undefined ? (
            <span className="size-7" />
          ) : session ? (
            <div className="relative" ref={menu}>
              <button
                aria-label="Account"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
                className="pressable flex size-7 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white"
              >
                {session.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </button>
              {open && (
                <div className="reveal absolute right-0 mt-2 w-56 origin-top-right rounded-2xl bg-surface p-1.5 shadow-[var(--shadow-raised)] ring-1 ring-line">
                  <div className="px-3 py-2">
                    <div className="footnote font-semibold">{session.name}</div>
                    <div className="caption text-muted">{session.email}</div>
                  </div>
                  <div className="my-1 h-px bg-line" />
                  <div className="px-1 py-1 md:hidden">
                    {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                      <button key={r} onClick={() => { setRole(r); setOpen(false); router.push(ROLE_HOME[r]); }} className={`footnote block w-full rounded-lg px-2 py-1.5 text-left hover:bg-fill ${role === r ? "text-accent" : ""}`}>
                        {ROLE_LABEL[r]} view
                      </button>
                    ))}
                    <div className="my-1 h-px bg-line" />
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      setOpen(false);
                      router.push("/");
                    }}
                    className="footnote w-full rounded-lg px-3 py-2 text-left text-bad hover:bg-fill"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button onClick={() => setPricing(true)} className="hidden rounded-full px-3 py-1.5 text-[13px] text-ink/70 hover:text-ink sm:inline">Pricing</button>
              <Link href="/login" className="rounded-full px-3 py-1.5 text-[13px] text-ink/70 hover:text-ink">Sign in</Link>
              <Link href="/signup" className="btn-primary px-3.5! py-1! text-[13px]!">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
    <PricingModal open={pricing} onClose={() => setPricing(false)} onChoose={() => router.push("/signup")} />
    </>
  );
}

"use client";

import { useSyncExternalStore } from "react";

/** Demo-only session kept in localStorage. No real authentication happens. */
export type Role = "flyer" | "corporate" | "advocate";
export interface DemoSession {
  name: string;
  email: string;
  role: Role;
  /** True for accounts created in this browser via sign-up: they start with no claim history. */
  isNew?: boolean;
  org?: string;
}

const KEY = "aeroclaim.session";
const listeners = new Set<() => void>();
let cache: { raw: string | null; value: DemoSession | null } = { raw: null, value: null };

function read(): DemoSession | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return null;
  }
  if (raw !== cache.raw) {
    try {
      cache = { raw, value: raw ? (JSON.parse(raw) as DemoSession) : null };
    } catch {
      cache = { raw, value: null };
    }
  }
  return cache.value;
}

function write(s: DemoSession | null) {
  try {
    if (s) localStorage.setItem(KEY, JSON.stringify(s));
    else localStorage.removeItem(KEY);
  } catch {
    /* storage blocked: the demo still works for this page view */
  }
  listeners.forEach((l) => l());
}

export function useSession(): DemoSession | null | undefined {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      window.addEventListener("storage", cb);
      return () => {
        listeners.delete(cb);
        window.removeEventListener("storage", cb);
      };
    },
    read,
    () => undefined, // server: unknown
  );
}

export const signIn = (s: DemoSession) => write(s);
export const signOut = () => write(null);
export const setRole = (role: Role) => {
  const s = read();
  write({ ...(s ?? { name: "Ananya Sharma", email: "ananya.sharma@example.com" }), role });
};

export const ROLE_HOME: Record<Role, string> = { flyer: "/dashboard", corporate: "/corporate", advocate: "/advocate" };
export const ROLE_LABEL: Record<Role, string> = { flyer: "Flyer", corporate: "Corporate", advocate: "Advocate" };

/* ---------- Protection tier (kept separately so it can be chosen before signing up) ---------- */
export type ProtectionTier = "trip_shield" | "annual_pass";
export const PROTECTION_LABEL: Record<ProtectionTier, string> = { trip_shield: "Trip Shield", annual_pass: "Annual Pass" };

const PKEY = "aeroclaim.protection";
const pListeners = new Set<() => void>();

function readProtection(): ProtectionTier | null {
  try {
    const v = localStorage.getItem(PKEY);
    return v === "trip_shield" || v === "annual_pass" ? v : null;
  } catch {
    return null;
  }
}

export function useProtection(): ProtectionTier | null | undefined {
  return useSyncExternalStore(
    (cb) => {
      pListeners.add(cb);
      window.addEventListener("storage", cb);
      return () => {
        pListeners.delete(cb);
        window.removeEventListener("storage", cb);
      };
    },
    readProtection,
    () => undefined,
  );
}

export function setProtection(tier: ProtectionTier | null) {
  try {
    if (tier) localStorage.setItem(PKEY, tier);
    else localStorage.removeItem(PKEY);
  } catch {
    /* storage blocked: selection lasts for this page view only */
  }
  pListeners.forEach((l) => l());
}

export function currentProtection(): ProtectionTier | null {
  return typeof window === "undefined" ? null : readProtection();
}

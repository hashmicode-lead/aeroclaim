"use client";

import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Days remaining computed in the viewer's browser (IST calendar day). */
export function Countdown({ due }: { due: string }) {
  const today = useSyncExternalStore(
    subscribe,
    () => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10),
    () => null,
  );
  if (!today) return <span className="text-muted">-</span>;
  const days = Math.round((Date.parse(due) - Date.parse(today)) / 86400000);
  const cls = days < 0 ? "text-bad" : days <= 3 ? "text-bad font-semibold" : days <= 7 ? "text-warn font-medium" : "text-muted";
  const label = days < 0 ? `${-days} day${days === -1 ? "" : "s"} ago` : days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`;
  return <span className={cls}>{label}</span>;
}

export function RecheckButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="btn-ghost px-3! py-1.5! text-xs"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch(`/api/claims/${id}/recheck`, { method: "POST" });
        setBusy(false);
        router.refresh();
      }}
    >
      {busy ? "Re-checking…" : "Re-run checks"}
    </button>
  );
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className="btn-ghost px-3! py-1.5! text-xs"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? "Copied" : label}
    </button>
  );
}

export function PrintButton() {
  return (
    <button className="btn-primary" onClick={() => window.print()}>
      Print / save as PDF
    </button>
  );
}

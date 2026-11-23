"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useSyncExternalStore } from "react";
import { Check, UploadCloud } from "lucide-react";
import type { DocKind } from "@/lib/types";

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
      className="btn-ghost"
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
      className="btn-ghost"
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

export function EvidenceUploader({ claimId }: { claimId: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedKind, setSelectedKind] = useState<DocKind>("e_ticket");

  async function handleFiles(files: FileList | File[]) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const fd = new FormData();
      for (const f of Array.from(files)) {
        fd.append("files", f);
        fd.append("kinds", selectedKind);
      }

      const res = await fetch(`/api/claims/${claimId}/documents`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to upload evidence");
      }

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-line bg-fill p-3.5 sm:p-4">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="footnote font-semibold">Upload missing evidence</span>
        {success && (
          <span className="caption flex items-center gap-1 font-medium text-ok">
            <Check size={14} /> Added & assessment updated!
          </span>
        )}
      </div>
      <p className="caption text-muted mb-3">
        Upload your e-ticket PDF, SMS screenshot, or boarding pass to satisfy airline evidence rules.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={selectedKind}
          onChange={(e) => setSelectedKind(e.target.value as DocKind)}
          className="field w-auto! bg-surface! py-1! text-xs!"
          aria-label="Document type"
        >
          <option value="e_ticket">E-ticket / Itinerary</option>
          <option value="airline_notice">Airline SMS / Notice</option>
          <option value="boarding_pass">Boarding Pass</option>
          <option value="receipt">Expense Receipt</option>
          <option value="pir">Property Irregularity Report (PIR)</option>
        </select>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.txt"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="btn-primary py-1! px-3! text-xs! flex items-center gap-1.5"
        >
          <UploadCloud size={14} />
          {uploading ? "Uploading…" : "Upload evidence file"}
        </button>
      </div>

      {error && <p className="caption mt-2 text-bad">{error}</p>}
    </div>
  );
}

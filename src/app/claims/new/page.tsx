import { Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ClaimForm } from "@/components/ClaimForm";

export const metadata: Metadata = { title: "New claim" };

export default function NewClaimPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="reveal px-1">
        <h1 className="title-1">Start a claim</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Tell us what happened. We check it against DGCA rules, the Montreal Convention and recorded airport weather, then build your claim letter and deadline calendar.
        </p>
      </header>
      <Link href="/demo" className="pressable card mt-6 flex items-center gap-4 p-5 hover:bg-surface-2">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <Sparkles size={20} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="headline block">No documents handy? Load the live demo</span>
          <span className="footnote block text-muted">A 6h 20m clear-sky delay plus a damaged international bag, with Visa cover: ₹1,82,400.</span>
        </span>
        <span className="text-accent" aria-hidden>›</span>
      </Link>
      <div className="mt-8">
        <ClaimForm directUpload={Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID)} />
      </div>
    </div>
  );
}

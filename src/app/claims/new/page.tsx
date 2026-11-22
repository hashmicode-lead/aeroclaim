import type { Metadata } from "next";
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
      <div className="mt-8">
        <ClaimForm directUpload={Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID)} />
      </div>
    </div>
  );
}

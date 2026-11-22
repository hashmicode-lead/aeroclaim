import type { Metadata } from "next";
import { ClaimForm } from "@/components/ClaimForm";

export const metadata: Metadata = { title: "New claim" };

export default function NewClaimPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Start a claim</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Tell us what happened. We check it against DGCA rules, the Montreal Convention and recorded airport weather, then build your claim letter and deadline calendar.
      </p>
      <div className="mt-8">
        <ClaimForm />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { ProtectionPlans } from "@/components/ProtectionPlans";

export const metadata: Metadata = {
  title: "Travel protection",
  description: "Single-trip, annual and business travel protection: delay payouts to UPI, separate-PNR cover, baggage deadline protection and one claim timeline.",
};

export default function ProtectionPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 pb-12 sm:px-6">
      <section className="hero-glow reveal relative pt-20 pb-14 text-center sm:pt-28">
        <p className="headline text-accent">Travel Protection &amp; Insurance Plans</p>
        <h1 className="display mx-auto mt-3 max-w-3xl text-balance">Covered before anything goes wrong.</h1>
        <p className="title-2 mx-auto mt-5 max-w-xl font-normal! text-balance text-muted">
          Airline rules leave gaps. Protection fills them, pays out automatically, and keeps every deadline for you.
        </p>
      </section>
      <ProtectionPlans />
    </div>
  );
}

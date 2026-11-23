import { ArrowRight, CreditCard } from "lucide-react";
import Link from "next/link";
import { AdPopup } from "@/components/AdPopup";
import { ClientStories } from "@/components/ClientStories";
import { InsuranceAd } from "@/components/InsuranceAd";
import { NETWORK_PAIR, NETWORKS } from "@/lib/networks";

const TRACKS = [
  { t: "Cancelled flight", stat: "Up to ₹10,000", sub: "cash compensation, plus a full refund", d: "Under DGCA CAR Section 3, Series M, Part IV: cash compensation applies when informed less than 24 hours before departure (or at the airport) without a suitable alternate flight. Full refund or alternate options kick in at more than 6 hours delay." },
  { t: "Bumped from your flight", stat: "Up to ₹20,000", sub: "if the airline overbooked and refused you", d: "The later your replacement flight, the more you get: up to 4 times your base fare." },
  { t: "Lost or damaged bag", stat: "Up to ₹1.8 lakh", sub: "per passenger on international flights", d: "You must complain in writing within 7 days for damage, 21 days for a late bag. We remind you before time runs out." },
  { t: "Refund not received", stat: "Within 7 days", sub: "is how fast airlines must refund card payments", d: "Booked through an agent? 30 working days. If the airline is late, we help you get the money back through your bank." },
  { t: "Card cover & insurance", stat: "Up to ₹10 lakh", sub: "complimentary travel & delay protection", d: "Paid by Visa or Mastercard? Check if your card already covers delays, separate-PNR missed connections, or baggage damage.", href: "/cards" },
];

const AUDIENCES = [
  { href: "/for/travellers", t: "Travellers", d: "Claim compensation, refunds and baggage payouts for your own flights. Free to start.", cta: "Sign up free" },
  { href: "/for/businesses", t: "Businesses", d: "Audit every employee booking and recover unused and delayed travel spend.", cta: "Start a trial" },
  { href: "/for/advocates", t: "Advocates", d: "Receive evidence-checked consumer cases above ₹50,000 and consult by video.", cta: "Join as advocate" },
];

const STEPS = [
  { t: "Create your account", d: "Sign up with Google or email. It takes under a minute." },
  { t: "Add your flight", d: "Upload the ticket and the airline's SMS. We read the details for you." },
  { t: "Get your claim pack", d: "See what you're owed, why, and the deadlines, with letters ready to send." },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="reveal pt-20 pb-16 text-center sm:pt-28 sm:pb-20">
        <div className="hero-recede">
        <p className="headline text-accent">Flight claims for India</p>
        <h1 className="display mx-auto mt-3 max-w-3xl text-balance">Your flight went wrong. Get back what you&apos;re owed.</h1>
        <p className="title-2 mx-auto mt-5 max-w-2xl font-normal! text-balance text-muted">
          AeroClaim checks your flight against DGCA rules, the Montreal Convention and real airport weather, then prepares every claim for you.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <Link href="/signup" className="btn-primary px-6! py-3! text-[17px]!">Create free account</Link>
          <Link href="/login" className="text-[17px] text-accent hover:underline">
            Log in <span aria-hidden>›</span>
          </Link>
        </div>
        <p className="footnote mt-4 text-muted">No card required. You pay only if you recover.*</p>
        <p className="caption mx-auto mt-1 max-w-md text-muted/80">*No win, no fee is offered only after we check your claim&apos;s risk. Depending on that check, the fee can change (25% if a consumer-commission filing is needed), or we may offer the ₹299 self-file kit instead.</p>
        </div>
      </section>

      <section aria-label="Who it's for" className="grid gap-3 sm:grid-cols-3">
        {AUDIENCES.map((a) => (
          <div key={a.t} className="scroll-rise">
          <Link href={a.href} className="pressable card group flex h-full flex-col p-6 hover:bg-surface-2">
            <span className="eyebrow">For</span>
            <span className="title-2 mt-1">{a.t}</span>
            <span className="footnote mt-1 flex-1 text-muted">{a.d}</span>
            <span className="footnote mt-4 inline-flex items-center gap-1 font-medium text-accent">{a.cta} <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden /></span>
          </Link>
          </div>
        ))}
      </section>

      <section aria-label="What we cover" className="mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4 px-1">
          <div>
            <h2 className="title-1 scroll-rise">Everything you are owed</h2>
            <p className="footnote mt-1 text-muted">AeroClaim audits all airline statutory entitlements and your individual card coverage.</p>
          </div>
          <Link href="/cards" className="btn-ghost hidden sm:inline-flex"><CreditCard size={15} aria-hidden /> Check card cover</Link>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TRACKS.map((x) => (
            <div key={x.t} className={`card scroll-rise flex flex-col p-7 ${x.href ? "shadow-[inset_0_0_0_2px_var(--accent-soft)]" : ""}`}>
              <div className="headline">{x.t}</div>
              <div className="title-1 mt-4 text-accent">{x.stat}</div>
              <div className="footnote text-muted">{x.sub}</div>
              <div className="grow-x mt-4 h-0.5 w-12 rounded-full bg-accent" aria-hidden />
              <p className="footnote mt-4 flex-1 text-ink/80">{x.d}</p>
              {x.href && (
                <Link href={x.href} className="btn-primary mt-5 text-[14px]!">
                  <CreditCard size={15} aria-hidden /> Check card cover
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="scroll-rise mt-6">
        <InsuranceAd variant="banner" index={0} />
      </div>

      <ClientStories />

      <section className="mt-20">
        <h2 className="title-1 scroll-rise text-center">Three steps to your claim</h2>
        <ol className="relative mt-10 grid gap-8 sm:grid-cols-3">
          <li aria-hidden className="grow-x absolute top-5 right-[8.3%] left-[8.3%] hidden h-0.5 rounded-full bg-accent-soft sm:block" />
          {STEPS.map((s, i) => (
            <li key={s.t} className="scroll-rise relative text-center">
              <div className="relative mx-auto flex size-10 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent">{i + 1}</div>
              <div className="headline mt-4">{s.t}</div>
              <p className="footnote mx-auto mt-1 max-w-xs text-muted">{s.d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 text-center">
          <Link href="/signup" className="btn-primary px-6! py-3! text-[17px]!">Create free account</Link>
        </div>
      </section>

      <AdPopup />
    </div>
  );
}

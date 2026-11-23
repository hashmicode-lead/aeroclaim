import { ArrowRight, CreditCard } from "lucide-react";
import Link from "next/link";
import { AdPopup } from "@/components/AdPopup";
import { CardOfferBanner } from "@/components/CardOfferBanner";
import { ClientStories } from "@/components/ClientStories";
import { InsuranceAd } from "@/components/InsuranceAd";
import { NETWORK_PAIR, NETWORKS } from "@/lib/networks";

const TRACKS = [
  { t: "Cancelled flight", stat: "Up to ₹10,000", sub: "cash compensation, plus a full refund", d: "If the airline cancels with less than two weeks' notice and no flight within 2 hours. You also get meals and a hotel while you wait." },
  { t: "Bumped from your flight", stat: "Up to ₹20,000", sub: "if the airline overbooked and refused you", d: "The later your replacement flight, the more you get: up to 4 times your base fare." },
  { t: "Lost or damaged bag", stat: "Up to ₹1.8 lakh", sub: "per passenger on international flights", d: "You must complain in writing within 7 days for damage, 21 days for a late bag. We remind you before time runs out." },
  { t: "Refund not received", stat: "Within 7 days", sub: "is how fast airlines must refund card payments", d: "Booked through an agent? 30 working days. If the airline is late, we help you get the money back through your bank." },
];

const AUDIENCES = [
  { t: "Travellers", d: "Claim compensation, refunds and baggage payouts for your own flights. Free to start.", cta: "Sign up free" },
  { t: "Businesses", d: "Audit every employee booking and recover unused and delayed travel spend.", cta: "Start a trial" },
  { t: "Advocates", d: "Receive evidence-checked consumer cases above ₹50,000 and consult by video.", cta: "Join as advocate" },
];

const STEPS = [
  { t: "Create your account", d: "Sign up with Google or email. It takes under a minute." },
  { t: "Add your flight", d: "Upload the ticket and the airline's SMS. We read the details for you." },
  { t: "Get your claim pack", d: "See what you're owed, why, and the deadlines, with letters ready to send." },
];

export default function Home() {
  return (
    <>
    <CardOfferBanner />
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
          <Link href="/signup" className="pressable card group flex h-full flex-col p-6 hover:bg-surface-2">
            <span className="eyebrow">For</span>
            <span className="title-2 mt-1">{a.t}</span>
            <span className="footnote mt-1 flex-1 text-muted">{a.d}</span>
            <span className="footnote mt-4 inline-flex items-center gap-1 font-medium text-accent">{a.cta} <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden /></span>
          </Link>
          </div>
        ))}
      </section>

      <section className="card scroll-rise mt-16 grid items-center gap-8 overflow-hidden p-7 sm:p-10 md:grid-cols-[1fr_auto]">
        <div>
          <p className="eyebrow">Card cover</p>
          <h2 className="title-1 mt-2">Paid by {NETWORK_PAIR} card? Your card may pay too.</h2>
          <p className="mt-3 max-w-lg text-muted">
            Premium cards include trip-delay and baggage insurance when the ticket was bought on the card. We check whether your booking qualifies and file the card claim alongside the airline claim.
          </p>
          <Link href="/cards" className="btn-primary mt-6"><CreditCard size={16} aria-hidden /> Check my card</Link>
        </div>
        <div className="tilt-in relative mx-auto h-44 w-72" aria-hidden>
          <div className="absolute top-6 left-8 h-40 w-64 rotate-6 rounded-2xl bg-gradient-to-br from-[#24303f] to-[#0e151d] shadow-[var(--shadow-raised)]">
            <div className="absolute right-4 bottom-4 flex items-center gap-1.5 text-white">
              <span className="size-4 rotate-45 rounded-[4px] border-2 border-white/80" />
              <span className="text-[13px] font-semibold tracking-wide">{NETWORKS.naster.name}</span>
            </div>
          </div>
          <div className="absolute top-0 left-0 h-40 w-64 -rotate-3 rounded-2xl bg-gradient-to-br from-[#0c6b5a] to-[#063b32] p-4 shadow-[var(--shadow-raised)]">
            <div className="h-6 w-9 rounded-md bg-gradient-to-br from-[#f5d98b] to-[#c9a44c]" />
            <div className="caption mt-8 font-mono tracking-[0.2em] text-white/80">•••• 4821</div>
            <div className="absolute right-4 bottom-3 text-base font-semibold tracking-[0.08em] text-white">{NETWORKS.wise.name.toUpperCase()}</div>
          </div>
        </div>
      </section>

      <section aria-label="What we cover" className="mt-16">
        <h2 className="title-1 scroll-rise text-center">Everything the airline owes you</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {TRACKS.map((x) => (
            <div key={x.t} className="card scroll-rise p-7">
              <div className="headline">{x.t}</div>
              <div className="title-1 mt-4 text-accent">{x.stat}</div>
              <div className="footnote text-muted">{x.sub}</div>
              <div className="grow-x mt-4 h-0.5 w-12 rounded-full bg-accent" aria-hidden />
              <p className="footnote mt-4 text-ink/80">{x.d}</p>
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
          <li aria-hidden className="grow-x absolute top-5 right-[16.7%] left-[16.7%] hidden h-0.5 rounded-full bg-accent-soft sm:block" />
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
    </>
  );
}

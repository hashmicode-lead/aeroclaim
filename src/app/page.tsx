import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ComparePlans } from "@/components/ComparePlans";
import { ClientStories } from "@/components/ClientStories";
import { NETWORK_PAIR } from "@/lib/networks";

const TRACKS = [
  { t: "Cancelled flight", stat: "Up to ₹10,000", sub: "plus a full refund or a new flight", d: "Told less than two weeks before, with no flight within 2 hours? The airline owes you cash." },
  { t: "Bumped from your flight", stat: "Up to ₹20,000", sub: "if the airline overbooked", d: "The later your replacement flight, the more you get: up to 4 times your base fare." },
  { t: "Lost or damaged bag", stat: "Up to ₹1.8 lakh", sub: "per passenger, international flights", d: "Complain within 7 days for damage, 21 for a late bag. We remind you in time." },
  { t: "Refund not received", stat: "7 days", sub: "for airlines to refund card payments", d: "Booked through an agent? 30 working days. Late? We get it back through your bank." },
  { t: "Card cover", stat: "Up to ₹10 lakh", sub: "travel cover on eligible cards", d: `Paid by ${NETWORK_PAIR} card? Your card may cover delays and bags too.`, href: "/cards", cta: "Check card cover" },
];

const AUDIENCES = [
  { href: "/for/travellers", t: "Travellers", d: "Compensation, refunds and baggage payouts for your own flights.", cta: "Learn more" },
  { href: "/for/businesses", t: "Businesses", d: "Audit every employee booking and recover delayed travel spend.", cta: "Learn more" },
  { href: "/for/advocates", t: "Advocates", d: "Evidence-checked consumer cases above ₹50,000, with video consults.", cta: "Learn more" },
];

const STEPS = [
  { t: "Create your account", d: "Google or email, under a minute." },
  { t: "Add your flight", d: "Upload the ticket or the airline's SMS." },
  { t: "Get your claim pack", d: "What you're owed, why, and every deadline." },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-6">
      {/* Hero */}
      <section className="hero-glow reveal relative pt-20 pb-20 text-center sm:pt-32 sm:pb-28">
        <div className="hero-recede">
          <p className="headline text-accent">Flight claims for India</p>
          <h1 className="display mx-auto mt-4 max-w-3xl text-balance">Your flight went wrong. Get back what you&apos;re owed.</h1>
          <p className="title-2 mx-auto mt-6 max-w-xl font-normal! text-balance text-muted">
            We check your flight against the rules and real airport weather, then prepare every claim for you.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link href="/signup" className="btn-primary w-full px-7! py-3! text-[17px]! sm:w-auto">Create free account</Link>
            <Link href="/login" className="text-[17px] text-accent hover:underline">
              Log in <span aria-hidden>›</span>
            </Link>
          </div>
          <p className="footnote mt-5 text-muted">No card required. Pay only if you recover.*</p>
        </div>
      </section>

      {/* Who it's for */}
      <section aria-label="Who it's for" className="grid gap-4 sm:grid-cols-3">
        {AUDIENCES.map((a) => (
          <div key={a.t} className="scroll-rise">
            <Link href={a.href} className="pressable card group flex h-full flex-col p-7 hover:bg-surface-2">
              <span className="title-2">{a.t}</span>
              <span className="footnote mt-2 flex-1 text-muted">{a.d}</span>
              <span className="footnote mt-6 inline-flex items-center gap-1 font-medium text-accent">
                {a.cta} <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          </div>
        ))}
      </section>

      {/* What we cover */}
      <section aria-labelledby="cover-title" className="mt-28 sm:mt-36">
        <div className="text-center">
          <h2 id="cover-title" className="title-1 scroll-rise">Everything you&apos;re owed</h2>
          <p className="mx-auto mt-3 max-w-lg text-muted">Airline entitlements and your card&apos;s cover, checked together.</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRACKS.map((x) => (
            <div key={x.t} className="card scroll-rise flex flex-col p-7">
              <div className="footnote font-semibold text-muted">{x.t}</div>
              <div className="title-1 mt-3 text-accent tabular-nums">{x.stat}</div>
              <div className="footnote mt-0.5 text-muted">{x.sub}</div>
              <p className="footnote mt-5 flex-1 border-t border-line pt-5 text-ink/80">{x.d}</p>
              {x.href && (
                <Link href={x.href} className="footnote mt-5 inline-flex items-center gap-1 font-medium text-accent hover:underline">
                  {x.cta} <ArrowRight size={14} aria-hidden />
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="mt-28 sm:mt-36">
        <ComparePlans />
      </div>

      <div className="mt-28 sm:mt-36">
        <ClientStories />
      </div>

      {/* Steps */}
      <section aria-labelledby="steps-title" className="mt-28 pb-8 sm:mt-36">
        <h2 id="steps-title" className="title-1 scroll-rise text-center">Three steps to your claim</h2>
        <ol className="relative mt-14 grid gap-12 sm:grid-cols-3 sm:gap-8">
          <li aria-hidden className="grow-x absolute top-5 right-[16.7%] left-[16.7%] hidden h-0.5 rounded-full bg-accent-soft sm:block" />
          {STEPS.map((s, i) => (
            <li key={s.t} className="scroll-rise relative text-center">
              <div className="relative mx-auto flex size-10 items-center justify-center rounded-full bg-accent text-[15px] font-semibold text-white">{i + 1}</div>
              <div className="headline mt-5">{s.t}</div>
              <p className="footnote mx-auto mt-1 max-w-[16rem] text-muted">{s.d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-14 text-center">
          <Link href="/signup" className="btn-primary px-7! py-3! text-[17px]!">Create free account</Link>
          <p className="caption mx-auto mt-6 max-w-md text-muted">
            *No win, no fee is offered after a quick check of your claim. Depending on the result, the fee may change or we may suggest the ₹299 self-file kit.
          </p>
        </div>
      </section>

    </div>
  );
}

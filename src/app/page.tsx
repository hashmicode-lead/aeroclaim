import { ArrowRight, Briefcase, CreditCard, Plane, Scale } from "lucide-react";
import Link from "next/link";
import { AdPopup } from "@/components/AdPopup";
import { InsuranceAd } from "@/components/InsuranceAd";

const TRACKS = [
  { t: "Delays & cancellations", stat: "₹10,000", sub: "max cancellation compensation", d: "Compensation slabs by block time and notice window, plus meals, hotel and refund rights." },
  { t: "Denied boarding", stat: "400%", sub: "of basic fare + fuel, up to ₹20,000", d: "Depends on how late your alternate flight left." },
  { t: "Baggage", stat: "1,519 SDR", sub: "Montreal Convention liability", d: "We track the 7-day damage and 21-day delay notice deadlines for you." },
  { t: "Stuck refunds", stat: "7 days", sub: "airline deadline for card refunds", d: "30 working days through agents. We flag a card chargeback when the airline misses it." },
];

const AUDIENCES = [
  { Icon: Plane, t: "Travellers", d: "Claim compensation, refunds and baggage payouts for your own flights. Free to start.", cta: "Sign up free" },
  { Icon: Briefcase, t: "Businesses", d: "Audit every employee booking and recover unused and delayed travel spend.", cta: "Start a trial" },
  { Icon: Scale, t: "Advocates", d: "Receive evidence-checked consumer cases above ₹50,000 and consult by video.", cta: "Join as advocate" },
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
        <p className="footnote mt-4 text-muted">No card required. You pay only if you recover.</p>
      </section>

      <section aria-label="Who it's for" className="grid gap-3 sm:grid-cols-3">
        {AUDIENCES.map((a) => (
          <Link key={a.t} href="/signup" className="pressable card group flex flex-col p-6 hover:bg-surface-2">
            <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent"><a.Icon size={20} aria-hidden /></span>
            <span className="headline mt-4">{a.t}</span>
            <span className="footnote mt-1 flex-1 text-muted">{a.d}</span>
            <span className="footnote mt-4 inline-flex items-center gap-1 font-medium text-accent">{a.cta} <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden /></span>
          </Link>
        ))}
      </section>

      <section className="card mt-16 grid items-center gap-8 overflow-hidden p-7 sm:p-10 md:grid-cols-[1fr_auto]">
        <div>
          <p className="eyebrow">Card cover</p>
          <h2 className="title-1 mt-2">Paid with Visa or Mastercard? Your card may pay too.</h2>
          <p className="mt-3 max-w-lg text-muted">
            Premium cards include trip-delay and baggage insurance when the ticket was bought on the card. We check whether your booking qualifies and file the card claim alongside the airline claim.
          </p>
          <Link href="/cards" className="btn-primary mt-6"><CreditCard size={16} aria-hidden /> Check my card</Link>
        </div>
        <div className="relative mx-auto h-44 w-72" aria-hidden>
          <div className="absolute top-6 left-8 h-40 w-64 rotate-6 rounded-2xl bg-gradient-to-br from-[#2b2b2e] to-[#0b0b0c] shadow-[var(--shadow-raised)]">
            <div className="absolute right-4 bottom-4 flex">
              <span className="size-7 rounded-full bg-[#eb001b]" />
              <span className="-ml-3 size-7 rounded-full bg-[#f79e1b] mix-blend-screen" />
            </div>
          </div>
          <div className="absolute top-0 left-0 h-40 w-64 -rotate-3 rounded-2xl bg-gradient-to-br from-[#1a3a8f] to-[#0b1f5c] p-4 shadow-[var(--shadow-raised)]">
            <div className="h-6 w-9 rounded-md bg-gradient-to-br from-[#f5d98b] to-[#c9a44c]" />
            <div className="caption mt-8 font-mono tracking-[0.2em] text-white/80">•••• 4821</div>
            <div className="absolute right-4 bottom-3 text-lg font-bold italic text-white">VISA</div>
          </div>
        </div>
      </section>

      <section aria-label="What we cover" className="mt-16">
        <h2 className="title-1 text-center">Everything the airline owes you</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {TRACKS.map((x) => (
            <div key={x.t} className="card p-7">
              <div className="headline">{x.t}</div>
              <div className="title-1 mt-4 text-accent">{x.stat}</div>
              <div className="footnote text-muted">{x.sub}</div>
              <p className="footnote mt-4 text-ink/80">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6">
        <InsuranceAd variant="banner" index={0} />
      </div>

      <section className="mt-20">
        <h2 className="title-1 text-center">Three steps to your claim</h2>
        <ol className="mt-10 grid gap-8 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.t} className="text-center">
              <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent">{i + 1}</div>
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

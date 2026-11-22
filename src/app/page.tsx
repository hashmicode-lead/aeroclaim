import Link from "next/link";

const TRACKS = [
  { t: "Delays & cancellations", stat: "₹10,000", sub: "max cancellation compensation", d: "Compensation slabs based on block time, notice window and the alternate flight offered, plus meals, hotel and refund rights." },
  { t: "Denied boarding", stat: "400%", sub: "of basic fare + fuel, up to ₹20,000", d: "Depends on how late your alternate flight left." },
  { t: "Baggage", stat: "1,519 SDR", sub: "Montreal Convention liability", d: "We track the 7-day damage and 21-day delay notice deadlines for you." },
  { t: "Stuck refunds", stat: "7 days", sub: "airline deadline for card refunds", d: "30 working days through agents. We flag a card chargeback when the airline misses it." },
];

const STEPS = [
  { t: "Upload", d: "E-ticket, boarding pass, PIR, the airline's SMS. We read out the PNR, flight and route." },
  { t: "Verify", d: "Rules are checked and airport weather is pulled, so a 'bad weather' excuse can be tested." },
  { t: "Act", d: "A ready-to-send claim letter, a timeline of events, and every legal deadline added to your calendar." },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="reveal pt-20 pb-16 text-center sm:pt-28 sm:pb-24">
        <p className="headline text-accent">Flight claims for India</p>
        <h1 className="display mx-auto mt-3 max-w-3xl text-balance">Your flight went wrong. Get back what you&apos;re owed.</h1>
        <p className="title-2 mx-auto mt-5 max-w-2xl font-normal! text-balance text-muted">
          We check what happened against DGCA rules, the Montreal Convention and real airport weather, then give you the claim letter and deadlines.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <Link href="/demo" className="btn-primary px-6! py-3! text-[17px]!">Run the ₹1,82,400 live demo</Link>
          <Link href="/claims/new" className="text-[17px] text-accent hover:underline">
            Check my own claim <span aria-hidden>›</span>
          </Link>
        </div>
      </section>

      <section aria-label="What we cover" className="grid gap-3 sm:grid-cols-2">
        {TRACKS.map((x) => (
          <div key={x.t} className="card p-7">
            <div className="headline">{x.t}</div>
            <div className="title-1 mt-4 text-accent">{x.stat}</div>
            <div className="footnote text-muted">{x.sub}</div>
            <p className="footnote mt-4 text-ink/80">{x.d}</p>
          </div>
        ))}
      </section>

      <section className="mt-20">
        <h2 className="title-1 text-center">Three steps, about two minutes.</h2>
        <ol className="mt-10 grid gap-8 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.t} className="text-center">
              <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent">{i + 1}</div>
              <div className="headline mt-4">{s.t}</div>
              <p className="footnote mx-auto mt-1 max-w-xs text-muted">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="card mt-20 flex flex-col gap-4 p-7 sm:flex-row sm:items-center">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-warn-soft text-warn" aria-hidden>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="headline">Still at the baggage belt?</div>
          <p className="footnote mt-0.5 text-muted">
            Don&apos;t leave arrivals without a printed Property Irregularity Report (PIR) and a photo of your bag tag. If you&apos;ve already left, start a claim now and we&apos;ll draft the written notice for you to send today.
          </p>
        </div>
        <Link href="/claims/new" className="btn-ghost">Start now</Link>
      </section>
    </div>
  );
}

import Link from "next/link";

const TRACKS = [
  { t: "Delays & cancellations", d: "DGCA CAR Part IV: compensation slabs by block time, notice window and alternate-flight rules, plus meals, hotel and refund rights." },
  { t: "Denied boarding", d: "200% or 400% of basic fare + fuel charge, capped at ₹10,000 or ₹20,000, depending on how late your alternate flight was." },
  { t: "Baggage", d: "Montreal Convention liability up to 1,519 SDR, with the 7-day (damage) and 21-day (delay) written-notice clocks tracked for you." },
  { t: "Stuck refunds", d: "CAR Part II timelines: 7 days for card payments, 30 working days via agents. Flags chargeback options when the airline misses them." },
];

const STEPS = [
  ["Upload", "E-ticket, boarding pass, PIR, airline SMS and receipts. We pull out PNR, flight and route."],
  ["Verify", "We check the rules and pull Open-Meteo weather at both airports, so a 'bad weather' excuse can be tested."],
  ["Act", "Get a claim letter, chronology and evidence index, plus a calendar file with every legal deadline."],
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="py-16 sm:py-24">
        <p className="text-sm font-medium text-accent">Flight, refund & baggage claim recovery for India</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Your flight went wrong. Find out what the airline owes you in two minutes.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted">
          AeroClaim checks your disruption against DGCA regulations, the Montreal Convention and recorded airport weather, then hands you a ready-to-send claim and every deadline that matters.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/claims/new" className="btn-primary px-6! py-3! text-base">Check my claim</Link>
          <Link href="/claims" className="btn-ghost px-6! py-3! text-base">View my claims</Link>
        </div>
      </section>

      <section className="grid gap-4 pb-16 sm:grid-cols-3">
        {STEPS.map(([t, d], i) => (
          <div key={t} className="card p-5">
            <div className="font-mono text-xs text-muted">0{i + 1}</div>
            <div className="mt-2 font-semibold">{t}</div>
            <p className="mt-1 text-sm text-muted">{d}</p>
          </div>
        ))}
      </section>

      <section className="pb-20">
        <h2 className="text-xl font-semibold tracking-tight">What we cover</h2>
        <div className="mt-5 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
          {TRACKS.map((x) => (
            <div key={x.t} className="bg-surface p-5">
              <div className="font-medium">{x.t}</div>
              <p className="mt-1 text-sm text-muted">{x.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-xl border border-warn/30 bg-warn-soft p-5 text-sm">
          <strong className="text-warn">Bag missing or damaged and you are still at the airport?</strong>{" "}
          Do not leave the arrivals hall without a printed Property Irregularity Report (PIR) and a photo of your bag tag. If you have already left, start a claim now and send the written notice today.
        </div>
      </section>
    </div>
  );
}

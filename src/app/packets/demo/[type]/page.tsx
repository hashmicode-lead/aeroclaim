import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/client";
import { demoBreakdown, demoClaim as c, demoTotal, demoUser as u, demoWeather as w, inr, packets, type PacketType } from "@/lib/demo";

export function generateStaticParams() {
  return packets.map((p) => ({ type: p.type }));
}

const TO: Record<PacketType, string> = {
  nodal: "The Nodal Officer, Customer Grievance Cell, Air India Limited, Airlines House, New Delhi",
  airsewa: "AirSewa Grievance Portal, Ministry of Civil Aviation",
  ejagriti: "The President, District Consumer Disputes Redressal Commission, New Delhi",
  chargeback: "Claims Department, Visa Infinite Travel Benefits (via issuing bank)",
};

const BODY: Record<PacketType, string[]> = {
  nodal: [
    `I travelled on ${c.airline} ${c.flight} from Delhi (DEL) to London (LHR) on 19 November 2026 under PNR ${c.pnr} with one co-passenger. The flight was scheduled to depart at ${c.scheduled} and departed at ${c.actual}, a delay of 6 hours 20 minutes.`,
    `The delay was attributed to "dense fog". Hourly weather data for Indira Gandhi International Airport (Open-Meteo, Annexure A-4) shows clear skies and visibility between 4.8 and 6.1 km throughout the six hours around departure. The stated reason is not supported. No meals or refreshments were provided, contrary to DGCA CAR Section 3, Series M, Part IV, para 3.4.`,
    `On arrival, one checked bag was found damaged and a second was delivered two days late. A Property Irregularity Report was filed at the airport (ref. ${c.pirNumber}). This letter constitutes written notice under Article 31 of the Montreal Convention, 1999, as given effect in India by the Carriage by Air Act, 1972.`,
  ],
  airsewa: [
    `Grievance category: Flight delay and baggage. Airline: ${c.airline}. Flight: ${c.flight}, 19 Nov 2026, DEL–LHR. PNR: ${c.pnr}.`,
    `Summary: Delay of 6h 20m, attributed to fog. Weather records show clear conditions (${w.summary}) Duty-of-care facilities were not provided. One bag was damaged and one delayed (PIR ${c.pirNumber}). A nodal notice was sent on 21 Nov 2026 with no resolution.`,
    "Relief sought: Compensation and reimbursement as itemised below, together with a written explanation of the cause of delay.",
  ],
  ejagriti: [
    `The Complainant, ${u.name}, is a consumer within the meaning of Section 2(7) of the Consumer Protection Act, 2019, having purchased air carriage from the Opposite Party for valuable consideration.`,
    "The Opposite Party delayed flight AI 161 by 6 hours 20 minutes, falsely attributed the delay to weather, failed to provide mandated facilities, and damaged and delayed the Complainant's baggage. These acts amount to deficiency in service under Section 2(11).",
    "The cause of action arose on 19 November 2026 at New Delhi, within the territorial jurisdiction of this Commission. The complaint is within limitation under Section 69, and the value of the claim is within this Commission's pecuniary jurisdiction.",
  ],
  chargeback: [
    `Cardholder: ${u.name}. Card: ${c.card}. Transaction: ${c.airline} ticket, PNR ${c.pnr}, paid in full on the card.`,
    "Benefit claimed: Trip delay (delay of more than 6 hours) and baggage delay (bag delivered after 48 hours), under the Visa Infinite travel benefits schedule.",
    "Enclosed: airline delay confirmation, PIR, itemised receipts for essentials purchased, boarding passes and card statement showing the ticket purchase.",
  ],
};

export default async function PacketDoc({ params }: PageProps<"/packets/demo/[type]">) {
  const { type } = await params;
  const p = packets.find((x) => x.type === type);
  if (!p) notFound();
  const t = p.type;
  const rows = t === "chargeback" ? demoBreakdown.filter((b) => b.track === "Card") : t === "nodal" || t === "airsewa" ? demoBreakdown.filter((b) => b.track === "Airline") : demoBreakdown;
  const total = rows.reduce((s, r) => s + r.inr, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 print:max-w-none print:p-0">
      <div className="no-print mb-6 flex items-center justify-between">
        <Link href="/packets/demo" className="footnote text-accent hover:underline">‹ Action hub</Link>
        <PrintButton />
      </div>
      <article className="card p-8 sm:p-12 print:p-0">
        <div className="flex items-start justify-between gap-6 border-b border-line pb-6">
          <div>
            <p className="eyebrow">{p.title}</p>
            <p className="caption mt-1 text-muted">Ref. {c.ref} · 21 Nov 2026</p>
          </div>
          <div className="text-right">
            <div className="footnote font-semibold">{u.name}</div>
            <div className="caption text-muted">{u.email}</div>
            <div className="caption text-muted">{u.phone}</div>
          </div>
        </div>

        <p className="footnote mt-6">To,<br />{TO[t]}</p>
        <p className="headline mt-6">
          Re: {t === "ejagriti" ? "Complaint of deficiency in service against Air India Limited" : `${c.flight}, 19 Nov 2026, PNR ${c.pnr}`}
        </p>

        <div className="mt-4 space-y-4 text-[15px] leading-[1.65]">
          {BODY[t].map((para, i) => <p key={i}>{para}</p>)}
        </div>

        <table className="footnote mt-8 w-full tabular-nums">
          <thead className="caption text-left text-muted">
            <tr className="border-b border-line">
              <th className="pb-2 font-medium">Head of claim</th>
              <th className="pb-2 font-medium">Basis</th>
              <th className="pb-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-line align-top">
                <td className="py-2.5 pr-4">{r.label}</td>
                <td className="caption py-2.5 pr-4 text-muted">{r.basis}</td>
                <td className="py-2.5 text-right">{inr(r.inr)}</td>
              </tr>
            ))}
            <tr>
              <td className="pt-3 font-semibold" colSpan={2}>Total</td>
              <td className="pt-3 text-right font-semibold">{inr(total)}</td>
            </tr>
          </tbody>
        </table>
        {t !== "chargeback" && t !== "ejagriti" && <p className="caption mt-2 text-muted">A Visa Infinite top-up of {inr(demoTotal - total)} is being claimed separately from the card issuer.</p>}

        <p className="mt-8 text-[15px] leading-[1.65]">
          {t === "ejagriti"
            ? "The Complainant prays that this Commission direct the Opposite Party to pay the amounts above with interest at 9% per annum, ₹10,000 towards litigation costs, and such further relief as the Commission deems fit."
            : "Please settle this claim within 30 days of receipt. If I do not hear from you, I will escalate to the Appellate Authority, AirSewa and the Consumer Commission."}
        </p>

        <div className="mt-10">
          <p className="footnote">Yours faithfully,</p>
          <p className="mt-6 font-[cursive] text-2xl text-ink/80">{u.name}</p>
          <p className="footnote">{u.name}</p>
        </div>

        <div className="mt-10 border-t border-line pt-6">
          <p className="eyebrow">Annexures</p>
          <ol className="footnote mt-2 list-inside list-decimal space-y-1 text-muted">
            <li>A-1 Boarding passes (2)</li>
            <li>A-2 E-ticket with fare breakup</li>
            <li>A-3 Property Irregularity Report {c.pirNumber}</li>
            <li>A-4 Open-Meteo weather certificate, DEL, 18–19 Nov 2026</li>
            <li>A-5 Photographs of damaged baggage (6)</li>
            <li>A-6 Itemised receipts (9)</li>
          </ol>
        </div>
        <p className="caption mt-8 text-muted">Prepared with AeroClaim OS · Sample document for demonstration.</p>
      </article>
    </div>
  );
}

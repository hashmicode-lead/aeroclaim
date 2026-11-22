import { getAirport } from "./airports";
import { formatDate, formatDateTime, inr, money } from "./time";
import { DOC_KIND_LABELS, type ClaimRecord } from "./types";

export interface Packet {
  to: string;
  subject: string;
  body: string;
  chronology: { when: string; what: string }[];
  annexures: { no: string; label: string; filename: string; docId: string }[];
}

const TYPE_LABEL = {
  delay: "flight delay",
  cancellation: "flight cancellation",
  denied_boarding: "denied boarding",
  baggage: "baggage claim",
  refund: "pending ticket refund",
} as const;

export function buildPacket(claim: ClaimRecord, today: string): Packet {
  const { input: i, assessment: a, weather } = claim;
  const o = getAirport(i.origin);
  const d = getAirport(i.destination);
  const route = `${o?.city ?? i.origin} (${i.origin}) to ${d?.city ?? i.destination} (${i.destination})`;
  const flightLine = `${i.flightNumber} on ${formatDateTime(i.scheduledDeparture)}, ${route}`;

  const annexures = claim.documents.map((doc, idx) => ({
    no: `A-${idx + 1}`,
    label: DOC_KIND_LABELS[doc.kind],
    filename: doc.filename,
    docId: doc.id,
  }));

  const chronology: Packet["chronology"] = [];
  if (i.bookingDate) chronology.push({ when: formatDate(i.bookingDate), what: `Ticket booked (PNR ${i.pnr})${i.bookingChannel === "agent" ? " through a travel agent or portal" : " directly with the airline"}.` });
  if (i.disruptionType === "cancellation" && i.cancellationNoticeHours !== undefined)
    chronology.push({ when: `${i.cancellationNoticeHours} h before departure`, what: "Airline notified me of the cancellation." });
  chronology.push({ when: formatDateTime(i.scheduledDeparture), what: `Scheduled departure of ${i.flightNumber} from ${i.origin}.` });
  if (i.actualDeparture) chronology.push({ when: formatDateTime(i.actualDeparture), what: `Actual departure${a.delayMinutes ? `: a delay of ${Math.floor(a.delayMinutes / 60)}h ${a.delayMinutes % 60}m` : ""}.` });
  if (i.alternateDeparture) chronology.push({ when: formatDateTime(i.alternateDeparture), what: "Departure of the alternate flight offered by the airline." });
  if (i.scheduledArrival) chronology.push({ when: formatDateTime(i.scheduledArrival), what: `Scheduled arrival at ${i.destination}.` });
  if (i.pirFiled || i.pirNumber) chronology.push({ when: "At arrival", what: `Property Irregularity Report filed${i.pirNumber ? ` (ref. ${i.pirNumber})` : ""}.` });
  if (i.baggageReceivedOn) chronology.push({ when: formatDate(i.baggageReceivedOn), what: "Baggage delivered to me." });
  if (i.refundRequestedOn) chronology.push({ when: formatDate(i.refundRequestedOn), what: "Ticket cancelled / refund requested." });
  chronology.push({ when: formatDate(today), what: "This claim sent." });

  const claimable = a.findings.filter((f) => f.status === "eligible" || f.status === "likely");
  const demands = claimable.map((f, n) => `${n + 1}. ${f.title}${f.amount ? `: ${money({ min: f.amount.max, max: f.amount.max })}` : ""} (${f.basis}).`);

  const facts: string[] = [];
  facts.push(`I was booked on ${flightLine} under PNR ${i.pnr}.`);
  if (i.disruptionType === "delay" && a.delayMinutes !== undefined)
    facts.push(`The flight departed ${Math.floor(a.delayMinutes / 60)} hours ${a.delayMinutes % 60} minutes late.${i.mealsProvided === false ? " No meals or refreshments were provided." : ""}${i.hotelProvided === false ? " No hotel accommodation was provided." : ""}`);
  if (i.disruptionType === "cancellation")
    facts.push(`The flight was cancelled${i.cancellationNoticeHours !== undefined ? ` and I was told only ${i.cancellationNoticeHours} hours before the scheduled departure` : ""}.${i.alternateOffered ? (i.alternateDeparture ? ` An alternate flight was offered departing ${formatDateTime(i.alternateDeparture)}.` : "") : " No alternate flight within two hours of the original departure was offered."}`);
  if (i.disruptionType === "denied_boarding")
    facts.push(`Although I held a confirmed reservation and reported for the flight on time, I was denied boarding against my will.${i.alternateDeparture ? ` I was re-accommodated on a flight departing ${formatDateTime(i.alternateDeparture)}.` : ""}`);
  if (i.disruptionType === "baggage")
    facts.push(`My checked baggage was ${i.baggageIssue ?? "mishandled"}${i.baggageReceivedOn ? ` and was delivered to me on ${formatDate(i.baggageReceivedOn)}` : ""}.${i.pirNumber ? ` A Property Irregularity Report was filed (ref. ${i.pirNumber}).` : ""} This letter is my written complaint under Article 31 of the Montreal Convention as applied by the Carriage by Air Act, 1972.`);
  if (i.refundRequestedOn && !i.refundReceived)
    facts.push(`I cancelled / requested a refund on ${formatDate(i.refundRequestedOn)}. The refund${i.refundAmountPending ? ` of ${inr(i.refundAmountPending)}` : ""} has still not been credited.`);
  if (i.airlineReason !== "unknown") facts.push(`The airline gave the reason as: ${i.airlineReason}.`);
  if (weather && weather.overall !== "unavailable") facts.push(`Independent weather data (Open-Meteo) for the airports around the scheduled times: ${weather.verdict}`);

  const body = [
    "Dear Sir/Madam,",
    "",
    `Subject: Claim for ${TYPE_LABEL[i.disruptionType]}, ${i.flightNumber} / PNR ${i.pnr}`,
    "",
    ...facts,
    "",
    "Under the applicable regulations I request the following:",
    ...(demands.length ? demands : ["1. A written explanation of the disruption and the remedies available to me under DGCA CAR Section 3, Series M, Part IV."]),
    "",
    claimable.some((f) => f.amount)
      ? `The total amount claimed is ${inr(a.estimate.max)}${a.estimate.min !== a.estimate.max ? " (subject to fare verification)" : ""}, plus reimbursement of the documented expenses enclosed.`
      : "Please also reimburse the documented expenses enclosed.",
    "",
    "Please acknowledge this claim and settle it within 30 days. If I do not hear from you, I will escalate the matter to your Appellate Authority, to AirSewa (Ministry of Civil Aviation), and to the Consumer Commission under the Consumer Protection Act, 2019.",
    "",
    annexures.length ? `Enclosures: ${annexures.map((x) => `${x.no} ${x.label}`).join("; ")}.` : "Enclosures: (attach your ticket, boarding pass and receipts).",
    "",
    "Yours faithfully,",
    i.passengerName,
    [i.email, i.phone].filter(Boolean).join(" | "),
  ].join("\n");

  return {
    to: `The Nodal Officer / Customer Relations, ${i.airline}`,
    subject: `Claim for ${TYPE_LABEL[i.disruptionType]}, ${i.flightNumber} / PNR ${i.pnr}`,
    body,
    chronology,
    annexures,
  };
}

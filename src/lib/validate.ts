import { getAirport } from "./airports";
import type { ClaimInput } from "./types";

const DT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const D = /^\d{4}-\d{2}-\d{2}$/;

const ENUMS = {
  disruptionType: ["delay", "cancellation", "denied_boarding", "baggage", "refund"],
  airlineReason: ["weather", "technical", "operational", "crew", "atc", "security", "strike", "unknown", "other"],
  bookingChannel: ["airline", "agent"],
  paymentMethod: ["credit_card", "debit_card", "upi", "netbanking", "cash", "wallet"],
  baggageIssue: ["delayed", "damaged", "lost", "pilfered"],
} as const;

export type ValidationResult = { ok: true; input: ClaimInput } | { ok: false; errors: Record<string, string> };

/** Coerce and validate untrusted form JSON into a ClaimInput. */
export function validateClaimInput(raw: unknown): ValidationResult {
  const r = (raw ?? {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const str = (k: string, max = 200) => {
    const v = r[k];
    return typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined;
  };
  const num = (k: string) => {
    const v = r[k];
    if (v === "" || v === null || v === undefined) return undefined;
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0) {
      errors[k] = "Must be a positive number";
      return undefined;
    }
    return n;
  };
  const bool = (k: string) => (r[k] === true || r[k] === "true" ? true : r[k] === false || r[k] === "false" ? false : undefined);
  const dt = (k: string) => {
    const v = str(k);
    if (v && !DT.test(v)) errors[k] = "Use date and time";
    return v && DT.test(v) ? v : undefined;
  };
  const d = (k: string) => {
    const v = str(k);
    if (v && !D.test(v)) errors[k] = "Use a date";
    return v && D.test(v) ? v : undefined;
  };
  function oneOf<K extends keyof typeof ENUMS>(k: K): (typeof ENUMS)[K][number] | undefined {
    const v = str(k);
    if (v && !(ENUMS[k] as readonly string[]).includes(v)) errors[k] = "Invalid choice";
    return v && (ENUMS[k] as readonly string[]).includes(v) ? (v as (typeof ENUMS)[K][number]) : undefined;
  }

  const input: Partial<ClaimInput> = {
    passengerName: str("passengerName", 120),
    email: str("email", 200),
    phone: str("phone", 30),
    pnr: str("pnr", 10)?.toUpperCase(),
    airline: str("airline", 80),
    flightNumber: str("flightNumber", 10)?.toUpperCase().replace(/\s/g, ""),
    origin: str("origin", 3)?.toUpperCase(),
    destination: str("destination", 3)?.toUpperCase(),
    scheduledDeparture: dt("scheduledDeparture"),
    scheduledArrival: dt("scheduledArrival"),
    actualDeparture: dt("actualDeparture"),
    disruptionType: oneOf("disruptionType"),
    airlineReason: oneOf("airlineReason") ?? "unknown",
    basicFarePlusFuel: num("basicFarePlusFuel"),
    totalFare: num("totalFare"),
    bookingChannel: oneOf("bookingChannel") ?? "airline",
    paymentMethod: oneOf("paymentMethod") ?? "credit_card",
    bookingDate: d("bookingDate"),
    missedConnection: bool("missedConnection"),
    singlePnr: bool("singlePnr"),
    cancellationNoticeHours: num("cancellationNoticeHours"),
    alternateOffered: bool("alternateOffered"),
    alternateDeparture: dt("alternateDeparture"),
    deniedVoluntary: bool("deniedVoluntary"),
    mealsProvided: bool("mealsProvided"),
    hotelProvided: bool("hotelProvided"),
    refundRequestedOn: d("refundRequestedOn"),
    refundReceived: bool("refundReceived"),
    refundAmountPending: num("refundAmountPending"),
    baggageIssue: oneOf("baggageIssue"),
    baggageReceivedOn: d("baggageReceivedOn"),
    pirFiled: bool("pirFiled"),
    pirNumber: str("pirNumber", 20)?.toUpperCase(),
    baggageClaimAmount: num("baggageClaimAmount"),
    notes: str("notes", 4000),
  };

  if (!input.passengerName) errors.passengerName = "Required";
  if (!input.pnr) errors.pnr = "Required";
  if (!input.flightNumber) errors.flightNumber = "Required";
  if (!input.airline) errors.airline = "Required";
  if (!input.scheduledDeparture && !errors.scheduledDeparture) errors.scheduledDeparture = "Required";
  if (!input.disruptionType && !errors.disruptionType) errors.disruptionType = "Required";
  if (!getAirport(input.origin)) errors.origin = "Select an airport";
  if (!getAirport(input.destination)) errors.destination = "Select an airport";
  if (input.origin && input.origin === input.destination) errors.destination = "Must differ from origin";
  if (input.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.email)) errors.email = "Invalid email";

  if (Object.keys(errors).length) return { ok: false, errors };
  // Strip undefined so stored JSON stays compact.
  return { ok: true, input: JSON.parse(JSON.stringify(input)) as ClaimInput };
}

export type DisruptionType = "delay" | "cancellation" | "denied_boarding" | "baggage" | "refund";
export type BaggageIssue = "delayed" | "damaged" | "lost" | "pilfered";
export type AirlineReason =
  | "weather"
  | "technical"
  | "operational"
  | "crew"
  | "atc"
  | "security"
  | "strike"
  | "unknown"
  | "other";
export type BookingChannel = "airline" | "agent";
export type PaymentMethod = "credit_card" | "debit_card" | "upi" | "netbanking" | "cash" | "wallet";

/** All local times are wall-clock times at the relevant airport, formatted `YYYY-MM-DDTHH:mm`. Dates are `YYYY-MM-DD`. */
export interface ClaimInput {
  passengerName: string;
  email?: string;
  phone?: string;

  pnr: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  scheduledDeparture: string;
  scheduledArrival?: string;
  actualDeparture?: string;

  disruptionType: DisruptionType;
  airlineReason: AirlineReason;

  /** One-way basic fare + airline fuel charge for the affected sector (INR). */
  basicFarePlusFuel?: number;
  /** Total amount paid for the ticket (INR). */
  totalFare?: number;
  bookingChannel: BookingChannel;
  paymentMethod: PaymentMethod;
  bookingDate?: string;

  // Connection context
  missedConnection?: boolean;
  singlePnr?: boolean;

  // Cancellation
  cancellationNoticeHours?: number;
  alternateOffered?: boolean;
  alternateDeparture?: string;

  // Denied boarding
  deniedVoluntary?: boolean;

  // Duty of care actually received
  mealsProvided?: boolean;
  hotelProvided?: boolean;

  // Refund
  refundRequestedOn?: string;
  refundReceived?: boolean;
  refundAmountPending?: number;

  // Baggage
  baggageIssue?: BaggageIssue;
  baggageReceivedOn?: string;
  pirFiled?: boolean;
  pirNumber?: string;
  baggageClaimAmount?: number;

  notes?: string;

  /** Protection plan the traveller chose (Trip Shield / Annual Pass), if any. */
  protectionTier?: "trip_shield" | "annual_pass";
}

export type FindingStatus = "eligible" | "likely" | "needs_info" | "not_eligible" | "info";

export interface Money {
  min: number;
  max: number;
}

export interface Finding {
  id: string;
  track: "dgca" | "montreal" | "refund" | "consumer" | "chargeback";
  title: string;
  status: FindingStatus;
  amount?: Money;
  basis: string;
  explanation: string;
}

export interface Deadline {
  id: string;
  title: string;
  due: string; // YYYY-MM-DD
  kind: "passenger" | "airline"; // passenger must act / airline must act
  hard: boolean;
  basis: string;
  description: string;
}

export interface EvidenceItem {
  id: string;
  label: string;
  required: boolean;
  docKinds: DocKind[];
  provided: boolean;
  tip?: string;
}

export type DocKind =
  | "boarding_pass"
  | "e_ticket"
  | "pir"
  | "baggage_tag"
  | "airline_notice"
  | "receipt"
  | "photo"
  | "bank_statement"
  | "correspondence"
  | "other";

export const DOC_KIND_LABELS: Record<DocKind, string> = {
  boarding_pass: "Boarding pass",
  e_ticket: "E-ticket / itinerary",
  pir: "Property Irregularity Report (PIR)",
  baggage_tag: "Baggage tag",
  airline_notice: "Airline delay / cancellation notice",
  receipt: "Expense receipt",
  photo: "Photo (damage / airport)",
  bank_statement: "Bank / card statement",
  correspondence: "Airline correspondence",
  other: "Other",
};

export type WeatherSeverity = "none" | "moderate" | "severe" | "unavailable";

export interface WeatherHour {
  time: string;
  code: number | null;
  description: string;
  visibilityM: number | null;
  windKmh: number | null;
  gustKmh: number | null;
  precipMm: number | null;
  severity: Exclude<WeatherSeverity, "unavailable">;
  reasons: string[];
}

export interface AirportWeather {
  airport: string;
  role: "departure" | "arrival";
  around: string;
  severity: WeatherSeverity;
  summary: string;
  hours: WeatherHour[];
  source: string;
  error?: string;
}

export interface WeatherReport {
  checkedAt: string;
  overall: WeatherSeverity;
  verdict: string;
  airports: AirportWeather[];
}

export interface Assessment {
  rulePack: string;
  isInternational: boolean;
  delayMinutes?: number;
  blockTimeMinutes?: number;
  extraordinaryRisk: "low" | "medium" | "high";
  extraordinaryNote: string;
  findings: Finding[];
  dutyOfCare: string[];
  deadlines: Deadline[];
  evidence: EvidenceItem[];
  estimate: Money;
  nextSteps: string[];
}

export interface StoredDocument {
  id: string;
  claimId: string;
  filename: string;
  mime: string;
  size: number;
  kind: DocKind;
  extracted?: string;
  createdAt: string;
}

export interface ClaimRecord {
  id: string;
  createdAt: string;
  input: ClaimInput;
  assessment: Assessment;
  weather: WeatherReport | null;
  documents: StoredDocument[];
}

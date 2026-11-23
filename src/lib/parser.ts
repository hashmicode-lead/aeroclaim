import { AIRLINES, getAirport } from "./airports";
import type { ClaimInput, DocKind } from "./types";

export interface ParseResult {
  fields: Partial<ClaimInput>;
  kind: DocKind;
  found: string[];
  missing: string[];
  source: "bcbp" | "text";
}

const MONTHS: Record<string, number> = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12 };
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Parse the IATA Bar Coded Boarding Pass (BCBP, Resolution 792) mandatory fields.
 * `year` resolves the Julian day-of-year, which carries no year.
 */
export function parseBcbp(raw: string, year = new Date().getFullYear()): Partial<ClaimInput> | null {
  const s = raw.replace(/\r?\n/g, "");
  if (!/^M[1-4]/.test(s) || s.length < 58) return null;
  const name = s.slice(2, 22).trim();
  const pnr = s.slice(23, 30).trim();
  const from = s.slice(30, 33);
  const to = s.slice(33, 36);
  const carrier = s.slice(36, 39).trim();
  const flight = s.slice(39, 44).trim().replace(/^0+/, "");
  const julian = Number(s.slice(44, 47));
  if (!/^[A-Z]{3}$/.test(from) || !/^[A-Z]{3}$/.test(to) || !julian) return null;
  const d = new Date(Date.UTC(year, 0, julian));
  const [last, first = ""] = name.split("/");
  return {
    passengerName: [first, last].map((p) => p.trim()).filter(Boolean).map(titleCase).join(" "),
    pnr,
    origin: from,
    destination: to,
    flightNumber: `${carrier}${flight}`,
    airline: AIRLINES[carrier] ?? carrier,
    scheduledDeparture: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T00:00`,
  };
}

function titleCase(s: string) {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function findDate(text: string): string | undefined {
  let m = text.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = text.match(/\b(\d{1,2})[\s-]?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept?|Oct|Nov|Dec)[a-z]*[\s,-]*(20\d{2})\b/i);
  if (m) return `${m[3]}-${pad(MONTHS[m[2].toLowerCase()])}-${pad(Number(m[1]))}`;
  m = text.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept?|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(20\d{2})\b/i);
  if (m) return `${m[3]}-${pad(MONTHS[m[1].toLowerCase()])}-${pad(Number(m[2]))}`;
  m = text.match(/\b(\d{1,2})[/.](\d{1,2})[/.](20\d{2})\b/); // Indian DD/MM/YYYY
  if (m) return `${m[3]}-${pad(Number(m[2]))}-${pad(Number(m[1]))}`;
  return undefined;
}

export function classifyDocument(text: string, filename = ""): DocKind {
  const t = `${filename} ${text}`.toLowerCase();
  if (/property irregularity|\bpir\b|worldtracer|file reference/.test(t)) return "pir";
  if (/boarding pass|gate closes|boarding time|\bseq\b|seat\s*\d{1,2}[a-k]/.test(t)) return "boarding_pass";
  if (/bag(gage)?\s*tag/.test(t)) return "baggage_tag";
  if (/\b(has been|is|was|been)\s+(delayed|cancel+ed|rescheduled|retimed)|schedule change|revised (departure|timing|time)/.test(t)) return "airline_notice";
  if (/statement|account summary|transaction history/.test(t)) return "bank_statement";
  if (/e-?ticket|itinerary|booking confirmation|fare (summary|breakup|details)/.test(t)) return "e_ticket";
  if (/receipt|invoice|tax invoice|bill no/.test(t)) return "receipt";
  if (/refund|dear (customer|passenger)|grievance|complaint/.test(t)) return "correspondence";
  if (/\.(jpe?g|png|heic|webp)$/.test(filename.toLowerCase())) return "photo";
  return "other";
}

export function parseText(text: string, filename = ""): ParseResult {
  const fields: Partial<ClaimInput> = {};
  const trimmed = text.trim();

  const bcbpLine = trimmed.split(/\r?\n/).find((l) => /^M[1-4].{56,}/.test(l.trim()));
  if (bcbpLine) {
    const b = parseBcbp(bcbpLine.trim());
    if (b) {
      return { fields: b, kind: "boarding_pass", source: "bcbp", ...report(b) };
    }
  }

  const pnr = text.match(/\b(?:PNR|Booking\s*(?:Ref(?:erence)?|ID|Code)|Confirmation\s*(?:No\.?|Number|Code)?|Airline\s*PNR)\s*[:#-]?\s*([A-Z0-9]{6})\b/i);
  if (pnr) fields.pnr = pnr[1].toUpperCase();

  const codes = Object.keys(AIRLINES).join("|");
  const flight = text.match(new RegExp(`\\b(${codes})[\\s-]?(\\d{2,4})\\b`));
  if (flight) {
    fields.flightNumber = `${flight[1]}${flight[2]}`;
    fields.airline = AIRLINES[flight[1]];
  }

  const route = text.match(/\b([A-Z]{3})\s*(?:-|–|—|→|->|to|\/)\s*([A-Z]{3})\b/);
  if (route && getAirport(route[1]) && getAirport(route[2])) {
    fields.origin = route[1];
    fields.destination = route[2];
  } else {
    const iatas = [...text.matchAll(/\b([A-Z]{3})\b/g)].map((m) => m[1]).filter((c) => getAirport(c));
    const uniq = [...new Set(iatas)];
    if (uniq.length >= 2) {
      fields.origin = uniq[0];
      fields.destination = uniq[1];
    }
  }

  const date = findDate(text);
  const times = [...text.matchAll(/\b([01]\d|2[0-3]):([0-5]\d)\b/g)].map((m) => `${m[1]}:${m[2]}`);
  if (date) {
    fields.scheduledDeparture = `${date}T${times[0] ?? "00:00"}`;
    if (times[1]) fields.scheduledArrival = `${date}T${times[1]}`;
  }

  const pir = text.match(/\b(?:PIR|File\s*(?:Ref(?:erence)?|No\.?))\s*[:#-]?\s*([A-Z]{5}\d{5})\b/i);
  if (pir) {
    fields.pirNumber = pir[1].toUpperCase();
    fields.pirFiled = true;
  }

  // Fare & price breakdown
  const basicMatch = text.match(/(?:basic\s*fare\s*(?:\+\s*fuel(?:\s*charge|\s*surcharge)?)?|base\s*fare(?:\s*\+\s*fuel)?|basic\s*\+\s*fuel)\s*[:=-]?\s*(?:₹|INR|Rs\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (basicMatch) fields.basicFarePlusFuel = Number(basicMatch[1].replace(/,/g, ""));

  const totalMatch = text.match(/(?:total(?:\s+fare)?(?:\s+paid)?(?:\s+amount)?|gross(?:\s+amount)?|amount\s+paid)\s*[:=-]?\s*(?:₹|INR|Rs\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (totalMatch) {
    fields.totalFare = Number(totalMatch[1].replace(/,/g, ""));
  } else {
    const amount = text.match(/(?:₹|INR|Rs\.?)\s*([\d,]+(?:\.\d{1,2})?)/i);
    if (amount) fields.totalFare = Number(amount[1].replace(/,/g, ""));
  }

  // Booking date
  const bDateMatch = text.match(/(?:booking\s*date|date\s*of\s*booking|booked\s*on|issue\s*date)\s*[:=-]?\s*([^\r\n,]+)/i);
  if (bDateMatch) {
    const d = findDate(bDateMatch[1]);
    if (d) fields.bookingDate = d;
  }

  // Payment method
  const payMatch = text.match(/(?:payment\s*(?:method|mode)|paid\s*(?:by|via|with))\s*[:=-]?\s*([^\r\n,]+)/i);
  if (payMatch) {
    const p = payMatch[1].toLowerCase();
    if (/credit|visa|mastercard|amex|diners|rupay/.test(p)) fields.paymentMethod = "credit_card";
    else if (/debit/.test(p)) fields.paymentMethod = "debit_card";
    else if (/upi|gpay|phonepe|paytm/.test(p)) fields.paymentMethod = "upi";
    else if (/net\s*banking|internet|bank\s*transfer/.test(p)) fields.paymentMethod = "netbanking";
    else if (/wallet/.test(p)) fields.paymentMethod = "wallet";
    else if (/cash/.test(p)) fields.paymentMethod = "cash";
  }

  const lower = text.toLowerCase();
  if (/cancel+ed|cancellation/.test(lower)) fields.disruptionType = "cancellation";
  else if (/delayed|delay|revised departure|rescheduled/.test(lower)) fields.disruptionType = "delay";
  if (/baggage|luggage|\bbag\b|\bpir\b/.test(lower)) fields.disruptionType = "baggage";
  if (/refund/.test(lower) && !fields.disruptionType) fields.disruptionType = "refund";
  if (/weather|fog|visibility|storm/.test(lower)) fields.airlineReason = "weather";
  else if (/technical|maintenance|aircraft (issue|problem)/.test(lower)) fields.airlineReason = "technical";
  else if (/operational/.test(lower)) fields.airlineReason = "operational";
  else if (/crew/.test(lower)) fields.airlineReason = "crew";
  else if (/\batc\b|air traffic/.test(lower)) fields.airlineReason = "atc";

  return { fields, kind: classifyDocument(text, filename), source: "text", ...report(fields) };
}

function report(f: Partial<ClaimInput>): { found: string[]; missing: string[] } {
  const mandatory: [keyof ClaimInput, string][] = [
    ["pnr", "PNR"],
    ["flightNumber", "Flight number"],
    ["origin", "Origin"],
    ["destination", "Destination"],
    ["scheduledDeparture", "Departure date"],
  ];
  const optional: [keyof ClaimInput, string][] = [
    ["basicFarePlusFuel", "Basic fare + fuel"],
    ["totalFare", "Total fare"],
    ["bookingDate", "Booking date"],
  ];
  return {
    found: [...mandatory, ...optional].filter(([k]) => f[k] !== undefined).map(([, l]) => l),
    missing: mandatory.filter(([k]) => f[k] === undefined).map(([, l]) => l),
  };
}

export function mergeParsed(results: ParseResult[]): Partial<ClaimInput> {
  const out: Partial<ClaimInput> = {};
  for (const r of results) {
    for (const [k, v] of Object.entries(r.fields)) {
      if (v !== undefined && (out as Record<string, unknown>)[k] === undefined) (out as Record<string, unknown>)[k] = v;
    }
  }
  return out;
}

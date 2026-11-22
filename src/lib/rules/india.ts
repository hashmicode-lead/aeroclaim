import { getAirport } from "../airports";
import {
  addDays,
  addWorkingDays,
  addYears,
  datePart,
  daysUntil,
  formatDate,
  inr,
  minutesBetweenWall,
  zonedToUtc,
} from "../time";
import type {
  Assessment,
  ClaimInput,
  Deadline,
  DocKind,
  EvidenceItem,
  Finding,
  Money,
} from "../types";
import type { RuleContext, RulePack } from "./pack";

/** Revised Montreal Convention baggage limit, effective 28 Dec 2024 (ICAO review under Art. 24). */
export const MONTREAL_BAGGAGE_SDR = 1519;
/** Approximate INR per SDR used for estimates only. Update from RBI/IMF reference rates. */
export const SDR_TO_INR = 120;

const CAR_IV = "DGCA CAR Section 3, Series M, Part IV";
const CAR_II = "DGCA CAR Section 3, Series M, Part II";
const MONTREAL = "Montreal Convention 1999 (Carriage by Air Act, 1972, Third Schedule)";
const CPA = "Consumer Protection Act, 2019";

type Risk = Assessment["extraordinaryRisk"];

function assessExtraordinary(input: ClaimInput, ctx: RuleContext): { risk: Risk; note: string } {
  const w = ctx.weather?.overall ?? "unavailable";
  const reason = input.airlineReason;

  if (reason === "weather") {
    if (w === "none")
      return {
        risk: "low",
        note: "The airline cited weather, but recorded conditions at the airports around the scheduled times show no significant adverse weather. That undercuts an 'extraordinary circumstances' defence.",
      };
    if (w === "severe")
      return {
        risk: "high",
        note: "Severe weather was recorded around the scheduled time. The airline's weather explanation is plausible, so cash compensation may be excluded. Duty of care and refund rights still apply.",
      };
    if (w === "moderate")
      return {
        risk: "medium",
        note: "Only marginal weather was recorded. The airline would need to show it actually prevented operation. Ask for the specific operational reason in writing.",
      };
    return {
      risk: "medium",
      note: "The airline cited weather, but no weather data could be checked. Ask the airline for written details.",
    };
  }
  if (["atc", "security", "strike"].includes(reason)) {
    return {
      risk: w === "none" ? "medium" : "high",
      note: "ATC restrictions, security threats and strikes are listed as extraordinary circumstances under the CAR. Ask for written confirmation of the specific cause.",
    };
  }
  if (w === "severe") {
    return {
      risk: "medium",
      note: "The airline did not cite weather, but severe weather was recorded. Expect the airline to argue it later.",
    };
  }
  if (reason === "technical")
    return {
      risk: "medium",
      note: "Routine technical faults are generally treated as within the airline's control. Airlines sometimes argue 'unexpected flight-safety shortcomings', so keep the stated reason in writing.",
    };
  if (reason === "operational" || reason === "crew")
    return { risk: "low", note: "Operational and crew issues are within the airline's control and are not extraordinary circumstances." };
  return { risk: "medium", note: "The cause is unclear. Ask the airline to state the reason in writing." };
}

function cancellationSlab(blockMin: number | undefined): number {
  if (blockMin === undefined) return 10000;
  if (blockMin <= 60) return 5000;
  if (blockMin <= 120) return 7500;
  return 10000;
}

function sum(findings: Finding[]): Money {
  return findings.reduce(
    (acc, f) => (f.amount && f.status !== "not_eligible" && f.status !== "info" ? { min: acc.min + f.amount.min, max: acc.max + f.amount.max } : acc),
    { min: 0, max: 0 },
  );
}

function evidenceFor(input: ClaimInput, docs: { kind: DocKind }[]): EvidenceItem[] {
  const has = (kinds: DocKind[]) => docs.some((d) => kinds.includes(d.kind));
  const items: Omit<EvidenceItem, "provided">[] = [
    {
      id: "ticket",
      label: "E-ticket or itinerary with PNR and fare breakup",
      required: true,
      docKinds: ["e_ticket"],
      tip: "The fare breakup shows basic fare + fuel charge (YQ), which caps DGCA compensation.",
    },
  ];
  const t = input.disruptionType;
  if (t !== "refund")
    items.push({ id: "bp", label: "Boarding pass or check-in confirmation", required: t !== "cancellation", docKinds: ["boarding_pass"] });

  if (t === "delay" || t === "cancellation") {
    items.push({ id: "notice", label: "Airline SMS/email announcing the delay or cancellation", required: true, docKinds: ["airline_notice", "correspondence"], tip: "It shows when you were told, which decides cancellation compensation." });
    items.push({
      id: "receipts",
      label: "Receipts for meals, hotel and transport you paid for",
      required: input.mealsProvided === false || input.hotelProvided === false,
      docKinds: ["receipt"],
    });
  }
  if (t === "denied_boarding") {
    items.push({ id: "denial", label: "Written reason for denied boarding from the airline", required: true, docKinds: ["correspondence", "airline_notice"], tip: "Ask the gate staff to note the reason in writing." });
  }
  if (t === "baggage") {
    items.push({ id: "tag", label: "Baggage tag / claim stub", required: true, docKinds: ["baggage_tag"] });
    items.push({
      id: "pir",
      label: "Property Irregularity Report (PIR)",
      required: true,
      docKinds: ["pir"],
      tip: "If you left without a PIR, send the written Art. 31 complaint to the airline at once. The written notice is what protects your claim legally.",
    });
    if (input.baggageIssue === "damaged" || input.baggageIssue === "pilfered")
      items.push({ id: "photos", label: "Photos of the damaged bag and contents", required: true, docKinds: ["photo"] });
    items.push({ id: "values", label: "Purchase receipts, repair estimate or receipts for interim purchases", required: true, docKinds: ["receipt"] });
  }
  if (t === "refund" || input.refundRequestedOn) {
    items.push({ id: "refundreq", label: "Cancellation confirmation and refund request", required: true, docKinds: ["correspondence", "airline_notice"] });
    items.push({ id: "statement", label: "Bank or card statement showing the refund was not credited", required: true, docKinds: ["bank_statement"] });
  }
  return items.map((i) => ({
    ...i,
    provided: has(i.docKinds) || (i.id === "pir" && !!input.pirNumber),
  }));
}

export function evaluateIndia(input: ClaimInput, ctx: RuleContext): Assessment {
  const origin = getAirport(input.origin);
  const dest = getAirport(input.destination);
  const isInternational = origin?.country !== "IN" || dest?.country !== "IN";
  const findings: Finding[] = [];
  const deadlines: Deadline[] = [];
  const dutyOfCare: string[] = [];
  const nextSteps: string[] = [];
  const flightDate = datePart(input.scheduledDeparture);
  const arrivalDate = datePart(input.scheduledArrival ?? input.scheduledDeparture);

  let blockTimeMinutes: number | undefined;
  if (input.scheduledArrival && origin && dest) {
    const mins = Math.round(
      (zonedToUtc(input.scheduledArrival, dest.tz).getTime() - zonedToUtc(input.scheduledDeparture, origin.tz).getTime()) / 60000,
    );
    if (mins > 0) blockTimeMinutes = mins;
  }
  const delayMinutes = input.actualDeparture ? minutesBetweenWall(input.scheduledDeparture, input.actualDeparture) : undefined;

  const { risk, note } = assessExtraordinary(input, ctx);

  // ---------- Delay ----------
  if (input.disruptionType === "delay") {
    if (delayMinutes === undefined) {
      findings.push({ id: "delay-info", track: "dgca", title: "Actual departure time needed", status: "needs_info", basis: CAR_IV, explanation: "Enter the actual departure time so the delay can be measured." });
    } else {
      const bt = blockTimeMinutes ?? 0;
      const mealThreshold = bt <= 150 ? 120 : bt <= 300 ? 180 : 240;
      const h = (m: number) => `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ""}`;
      const depHour = Number(input.scheduledDeparture.slice(11, 13));
      const nightDeparture = depHour >= 20 || depHour < 3;

      if (delayMinutes >= mealThreshold) {
        dutyOfCare.push(`Free meals and refreshments: your ${h(delayMinutes)} delay exceeds the ${h(mealThreshold)} threshold for this block time.`);
      }
      if (delayMinutes > 360) {
        dutyOfCare.push("Choice of an alternate flight within 6 hours of the original time, or a full refund.");
        findings.push({
          id: "delay-refund",
          track: "dgca",
          title: "Full refund or alternate flight (delay over 6 hours)",
          status: "eligible",
          basis: `${CAR_IV}, para 3.4`,
          explanation: "For delays over 6 hours the airline must offer an alternate flight or a full refund, including when it gave advance notice.",
        });
      }
      if (delayMinutes > 1440 || (delayMinutes > 360 && nightDeparture)) {
        dutyOfCare.push("Hotel accommodation with transfers, because the delay exceeds 24 hours (or 6 hours for a departure between 20:00 and 03:00).");
      }
      if (dutyOfCare.length && (input.mealsProvided === false || input.hotelProvided === false)) {
        findings.push({
          id: "delay-reimburse",
          track: "dgca",
          title: "Reimbursement of meals and hotel the airline did not provide",
          status: "eligible",
          basis: `${CAR_IV}, para 3.4`,
          explanation: "The airline had to provide these facilities. Claim back what you spent, with receipts.",
        });
      }
      findings.push({
        id: "delay-cpa",
        track: "consumer",
        title: "Compensation for deficiency in service",
        status: delayMinutes >= 120 && risk !== "high" ? "likely" : "info",
        basis: `${CPA}, s. 2(11) & 35`,
        explanation:
          "DGCA sets no fixed cash compensation for delays. Consumer commissions do award compensation for unexplained or badly handled delays, decided case by case. Your evidence and the airline's stated reason matter most.",
      });
    }
  }

  // ---------- Cancellation ----------
  if (input.disruptionType === "cancellation") {
    const slab = cancellationSlab(blockTimeMinutes);
    const comp = input.basicFarePlusFuel ? Math.min(slab, input.basicFarePlusFuel) : slab;
    const notice = input.cancellationNoticeHours;
    const altWithin2h =
      input.alternateOffered && input.alternateDeparture
        ? minutesBetweenWall(input.scheduledDeparture, input.alternateDeparture) <= 120
        : false;

    dutyOfCare.push("A full refund or a free alternate flight, whatever the cause of the cancellation.");
    dutyOfCare.push("Meals and refreshments while you wait for the alternate flight, and a hotel if the wait is overnight.");

    let status: Finding["status"];
    let explanation: string;
    if (notice === undefined) {
      status = "needs_info";
      explanation = "Enter how many hours before departure the airline told you. Compensation depends on the notice period.";
    } else if (notice >= 14 * 24) {
      status = "not_eligible";
      explanation = "You were told at least two weeks ahead, so no compensation is due. You are still entitled to a refund or an alternate flight.";
    } else if (altWithin2h) {
      status = "not_eligible";
      explanation = "The airline offered an alternate flight leaving within 2 hours of the original time, which removes the compensation obligation.";
    } else {
      status = risk === "low" ? "eligible" : "likely";
      explanation = `You were told ${notice < 24 ? "less than 24 hours" : "less than two weeks"} before departure and were not offered an alternate flight within 2 hours. Compensation for a ${blockTimeMinutes ? `${blockTimeMinutes}-minute` : "flight of this"} block time is ${inr(slab)}, or the one-way basic fare plus fuel charge if that is lower.${risk !== "low" ? " The airline may claim extraordinary circumstances. See the weather and cause check." : ""}`;
    }
    findings.push({
      id: "cancel-comp",
      track: "dgca",
      title: "Cancellation compensation",
      status,
      amount: status === "eligible" ? { min: comp, max: comp } : status === "likely" ? { min: 0, max: comp } : undefined,
      basis: `${CAR_IV}, para 3.2 & 3.6`,
      explanation,
    });
  }

  // ---------- Denied boarding ----------
  if (input.disruptionType === "denied_boarding") {
    if (input.deniedVoluntary) {
      findings.push({ id: "db-vol", track: "dgca", title: "Voluntary surrender of seat", status: "info", basis: `${CAR_IV}, para 3.5`, explanation: "You agreed to give up your seat, so the benefits you negotiated apply rather than statutory compensation. Hold the airline to anything it promised in writing." });
    } else {
      const fare = input.basicFarePlusFuel;
      let pct = 0;
      let cap = 0;
      let label = "";
      if (!input.alternateOffered || !input.alternateDeparture) {
        pct = 4; cap = 20000; label = "No alternate flight was arranged: 400% of basic fare + fuel charge, capped at ₹20,000, plus a full refund.";
      } else {
        const diff = minutesBetweenWall(input.scheduledDeparture, input.alternateDeparture);
        if (diff <= 60) label = "The alternate flight left within 1 hour of your original departure, so no compensation is due.";
        else if (diff <= 1440) { pct = 2; cap = 10000; label = "Alternate flight within 24 hours: 200% of basic fare + fuel charge, capped at ₹10,000."; }
        else { pct = 4; cap = 20000; label = "Alternate flight more than 24 hours later: 400% of basic fare + fuel charge, capped at ₹20,000."; }
      }
      const amt = pct ? (fare ? Math.min(pct * fare, cap) : cap) : 0;
      findings.push({
        id: "db-comp",
        track: "dgca",
        title: "Denied boarding compensation",
        status: pct ? (fare ? "eligible" : "likely") : "not_eligible",
        amount: pct ? { min: fare ? amt : 0, max: amt } : undefined,
        basis: `${CAR_IV}, para 3.5`,
        explanation: label + (pct && !fare ? " Enter the basic fare + fuel charge for an exact figure." : "") + " This does not apply if boarding was refused for health, safety, security, travel documents or late reporting.",
      });
      dutyOfCare.push("Meals and refreshments while you wait, and a hotel if the alternate flight is the next day.");
    }
  }

  // ---------- Missed connection ----------
  if (input.missedConnection) {
    findings.push(
      input.singlePnr
        ? { id: "mct", track: "dgca", title: "Missed connection on a single booking", status: "eligible", basis: CAR_IV, explanation: "Both flights were on one PNR, so the airline must re-route you to your final destination at no cost and look after you while you wait." }
        : { id: "mct", track: "dgca", title: "Missed connection on separate bookings", status: "info", basis: CAR_IV, explanation: "With separate PNRs (a self-transfer) the first airline owes nothing for the onward flight. Check your travel or credit-card insurance for missed-connection cover." },
    );
  }

  // ---------- Baggage ----------
  if (input.disruptionType === "baggage") {
    const issue = input.baggageIssue;
    const limit = MONTREAL_BAGGAGE_SDR * SDR_TO_INR;
    const claim = input.baggageClaimAmount;
    if (!issue) {
      findings.push({ id: "bag-info", track: "montreal", title: "Baggage issue type needed", status: "needs_info", basis: MONTREAL, explanation: "Select whether your bag was delayed, damaged, pilfered or lost." });
    } else {
      const received = input.baggageReceivedOn;
      if ((issue === "damaged" || issue === "pilfered") && received) {
        deadlines.push({ id: "bag-7d", title: "Written damage complaint to airline", due: addDays(received, 7), kind: "passenger", hard: true, basis: `${MONTREAL}, Art. 31(2)`, description: "File a written complaint within 7 days of receiving the bag. Without it you lose the right to claim, except in cases of fraud." });
      }
      if (issue === "delayed" && received) {
        deadlines.push({ id: "bag-21d", title: "Written delay complaint to airline", due: addDays(received, 21), kind: "passenger", hard: true, basis: `${MONTREAL}, Art. 31(2)`, description: "File a written complaint within 21 days of the bag being returned to you, listing the interim expenses you are claiming." });
      }
      if ((issue === "delayed" && !received) || issue === "lost") {
        deadlines.push({ id: "bag-lost", title: "Bag can be treated as lost", due: addDays(arrivalDate, 21), kind: "passenger", hard: false, basis: `${MONTREAL}, Art. 17(3)`, description: "If the bag has not arrived 21 days after it should have, you can claim it as lost. Send a written claim now anyway." });
      }
      if (!input.pirFiled && !input.pirNumber) {
        nextSteps.push("You have no PIR. Email the airline a written baggage complaint today, quoting your PNR, bag tag and what happened.");
      }
      for (const d of deadlines.filter((d) => d.hard)) {
        if (daysUntil(d.due, ctx.today) < 0) {
          findings.push({ id: "bag-late", track: "montreal", title: "The written-notice window has passed", status: "info", basis: `${MONTREAL}, Art. 31(4)`, explanation: `The ${d.title.toLowerCase()} was due on ${formatDate(d.due)}. Claims after this are normally barred. A complaint you already made in writing (a PIR or email) may count, so collect it.` });
        }
      }
      const capped = claim ? Math.min(claim, limit) : limit;
      findings.push({
        id: "bag-claim",
        track: "montreal",
        title: issue === "delayed" ? "Interim expenses for delayed baggage" : issue === "lost" ? "Lost baggage compensation" : "Damaged / pilfered baggage compensation",
        status: claim ? (isInternational ? "eligible" : "likely") : "needs_info",
        amount: claim ? { min: isInternational ? capped : 0, max: capped } : undefined,
        basis: `${MONTREAL}, Art. 17, 19 & 22(2)`,
        explanation:
          (isInternational
            ? `Airline liability is capped at ${MONTREAL_BAGGAGE_SDR} SDR (about ${inr(limit)}) per passenger, and you must prove your actual loss.`
            : "Domestic carriage falls under the Carriage by Air Act's Montreal-based schedule. Airlines often offer lower per-kg amounts under their conditions of carriage, which can be challenged before a consumer commission.") +
          (claim ? "" : " Enter the amount you are claiming."),
      });
    }
  }

  // ---------- Refund ----------
  if (input.disruptionType === "refund" || input.refundRequestedOn) {
    const pending = input.refundAmountPending ?? input.totalFare;
    if (!input.refundRequestedOn) {
      findings.push({ id: "refund-info", track: "refund", title: "Refund request date needed", status: "needs_info", basis: `${CAR_II}, para 2`, explanation: "Enter the date you cancelled or asked for the refund. The airline's deadline runs from that date." });
    } else if (!input.refundReceived) {
      let due: string;
      let rule: string;
      if (input.bookingChannel === "agent") {
        due = addWorkingDays(input.refundRequestedOn, 30);
        rule = "Booked through a travel agent or portal: the airline must make sure the refund is completed within 30 working days.";
      } else if (input.paymentMethod === "cash") {
        due = input.refundRequestedOn;
        rule = "Paid in cash at an airline office: the refund is due immediately.";
      } else {
        due = addDays(input.refundRequestedOn, 7);
        rule = "Paid by card or online directly to the airline: the refund is due within 7 days.";
      }
      deadlines.push({ id: "refund-due", title: "Airline refund due", due, kind: "airline", hard: true, basis: `${CAR_II}, para 2`, description: rule });
      const overdue = daysUntil(due, ctx.today) < 0;
      findings.push({
        id: "refund",
        track: "refund",
        title: overdue ? "Refund overdue" : "Refund pending",
        status: "eligible",
        amount: pending ? { min: pending, max: pending } : undefined,
        basis: `${CAR_II}, para 2`,
        explanation: `${rule} ${overdue ? `It was due on ${formatDate(due)}. The airline is in breach.` : `It is due by ${formatDate(due)}.`}`,
      });
      if (overdue && (input.paymentMethod === "credit_card" || input.paymentMethod === "debit_card")) {
        findings.push({ id: "chargeback", track: "chargeback", title: "Card chargeback (credit not processed)", status: "likely", basis: "Card network dispute rules (Visa / Mastercard / RuPay)", explanation: "Your refund is overdue and you paid by card, so you can raise a dispute with your card issuer. Attach the cancellation confirmation and the airline's refund promise." });
        deadlines.push({ id: "chargeback", title: "Card chargeback window (typical)", due: addDays(due, 120), kind: "passenger", hard: false, basis: "Card network rules", description: "Most networks allow about 120 days from the expected refund date. Check your issuer's own deadline." });
      }
      if (overdue && input.paymentMethod === "upi") {
        nextSteps.push("Paid by UPI: raise a complaint in your UPI app and with your bank. Escalate to the RBI Ombudsman (CMS portal) if the bank does not resolve it within 30 days.");
      }
    }
    if (input.disruptionType === "refund") {
      findings.push({ id: "taxes", track: "refund", title: "Statutory taxes are always refundable", status: "info", basis: `${CAR_II}`, explanation: "Even on non-refundable fares and no-shows, statutory levies (UDF, ASF/PSF, ADF and GST on them) must be refunded. Cancellation charges cannot exceed the basic fare plus fuel charge." });
    }
  }

  // ---------- Common: consumer forum & escalation ----------
  const incidentDate = input.disruptionType === "baggage" ? arrivalDate : flightDate;
  deadlines.push({
    id: "airsewa",
    title: "Escalate to AirSewa if the airline has not resolved it",
    due: addDays(ctx.today, 30),
    kind: "passenger",
    hard: false,
    basis: "AirSewa grievance process",
    description: "Give the airline's nodal officer about 30 days to reply. Then appeal to its Appellate Authority and file on AirSewa.",
  });
  deadlines.push({
    id: "ejagriti",
    title: "Consumer complaint limitation (e-Jagriti)",
    due: addYears(incidentDate, 2),
    kind: "passenger",
    hard: true,
    basis: `${CPA}, s. 69`,
    description: "A consumer complaint must be filed within 2 years of the incident. Claims up to ₹50 lakh go to the District Commission.",
  });
  if (isInternational) {
    deadlines.push({ id: "montreal-2y", title: "Court action limitation (Montreal Convention)", due: addYears(arrivalDate, 2), kind: "passenger", hard: true, basis: `${MONTREAL}, Art. 35`, description: "Court action against the carrier must start within 2 years of arrival." });
  }

  // ---------- Next steps ----------
  const urgent = deadlines.filter((d) => d.kind === "passenger" && d.hard && daysUntil(d.due, ctx.today) >= 0).sort((a, b) => a.due.localeCompare(b.due))[0];
  nextSteps.unshift(`Send the generated claim letter to ${input.airline || "the airline"}'s customer care, and copy its nodal grievance officer.`);
  if (urgent && urgent.id.startsWith("bag")) nextSteps.unshift(`Urgent: ${urgent.title.toLowerCase()} by ${formatDate(urgent.due)}.`);
  if (input.airlineReason === "unknown" || input.airlineReason === "other") nextSteps.push("Ask the airline to state the reason for the disruption in writing.");
  nextSteps.push("If there is no satisfactory reply within 30 days, appeal to the airline's Appellate Authority and file a grievance on AirSewa (airsewa.gov.in).");
  nextSteps.push(`If it is still unresolved, file a consumer complaint on e-Jagriti before ${formatDate(addYears(incidentDate, 2))}.`);

  deadlines.sort((a, b) => a.due.localeCompare(b.due));

  return {
    rulePack: "india",
    isInternational,
    delayMinutes,
    blockTimeMinutes,
    extraordinaryRisk: risk,
    extraordinaryNote: note,
    findings,
    dutyOfCare,
    deadlines,
    evidence: evidenceFor(input, ctx.documents),
    estimate: sum(findings),
    nextSteps,
  };
}

export const indiaPack: RulePack = {
  id: "india",
  name: "India: DGCA CAR, Montreal Convention and Consumer Protection Act",
  appliesTo: (input) => getAirport(input.origin)?.country === "IN" || getAirport(input.destination)?.country === "IN",
  evaluate: evaluateIndia,
};

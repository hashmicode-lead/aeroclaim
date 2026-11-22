import { describe, expect, it } from "vitest";
import { evaluateIndia } from "../rules/india";
import type { ClaimInput, WeatherReport } from "../types";

const base: ClaimInput = {
  passengerName: "Asha Rao",
  pnr: "X7K2QP",
  airline: "IndiGo",
  flightNumber: "6E2134",
  origin: "DEL",
  destination: "BOM",
  scheduledDeparture: "2026-11-10T06:10",
  scheduledArrival: "2026-11-10T08:25", // 135 min block
  disruptionType: "cancellation",
  airlineReason: "operational",
  bookingChannel: "airline",
  paymentMethod: "credit_card",
};
const ctx = { today: "2026-11-12", weather: null, documents: [] };
const find = (a: ReturnType<typeof evaluateIndia>, id: string) => a.findings.find((f) => f.id === id);

const weather = (overall: WeatherReport["overall"]): WeatherReport => ({ checkedAt: "", overall, verdict: "", airports: [] });

describe("cancellation", () => {
  it("pays ₹10,000 slab for >2h block, capped by basic fare + fuel", () => {
    const a = evaluateIndia({ ...base, cancellationNoticeHours: 5, basicFarePlusFuel: 6400 }, ctx);
    expect(a.blockTimeMinutes).toBe(135);
    const f = find(a, "cancel-comp")!;
    expect(f.status).toBe("eligible");
    expect(f.amount).toEqual({ min: 6400, max: 6400 });
  });

  it("uses ₹5,000 for block time up to 1 hour", () => {
    const a = evaluateIndia({ ...base, scheduledArrival: "2026-11-10T07:05", cancellationNoticeHours: 2, basicFarePlusFuel: 9000 }, ctx);
    expect(find(a, "cancel-comp")!.amount).toEqual({ min: 5000, max: 5000 });
  });

  it("no compensation with two weeks' notice", () => {
    const a = evaluateIndia({ ...base, cancellationNoticeHours: 400 }, ctx);
    expect(find(a, "cancel-comp")!.status).toBe("not_eligible");
  });

  it("no compensation if alternate leaves within 2 hours", () => {
    const a = evaluateIndia({ ...base, cancellationNoticeHours: 5, alternateOffered: true, alternateDeparture: "2026-11-10T07:50" }, ctx);
    expect(find(a, "cancel-comp")!.status).toBe("not_eligible");
  });

  it("becomes contestable when severe weather supports the airline", () => {
    const a = evaluateIndia({ ...base, airlineReason: "weather", cancellationNoticeHours: 5 }, { ...ctx, weather: weather("severe") });
    expect(a.extraordinaryRisk).toBe("high");
    const f = find(a, "cancel-comp")!;
    expect(f.status).toBe("likely");
    expect(f.amount!.min).toBe(0);
    expect(a.dutyOfCare.length).toBeGreaterThan(0);
  });

  it("weather excuse is undercut when no adverse weather was recorded", () => {
    const a = evaluateIndia({ ...base, airlineReason: "weather", cancellationNoticeHours: 5 }, { ...ctx, weather: weather("none") });
    expect(a.extraordinaryRisk).toBe("low");
    expect(find(a, "cancel-comp")!.status).toBe("eligible");
  });
});

describe("denied boarding", () => {
  const db = { ...base, disruptionType: "denied_boarding" as const, basicFarePlusFuel: 4000 };
  it("200% capped at ₹10,000 when alternate within 24h", () => {
    const a = evaluateIndia({ ...db, alternateOffered: true, alternateDeparture: "2026-11-10T12:00" }, ctx);
    expect(find(a, "db-comp")!.amount).toEqual({ min: 8000, max: 8000 });
  });
  it("400% capped at ₹20,000 when alternate beyond 24h", () => {
    const a = evaluateIndia({ ...db, basicFarePlusFuel: 6000, alternateOffered: true, alternateDeparture: "2026-11-11T09:00" }, ctx);
    expect(find(a, "db-comp")!.amount).toEqual({ min: 20000, max: 20000 });
  });
  it("nothing if alternate within 1 hour", () => {
    const a = evaluateIndia({ ...db, alternateOffered: true, alternateDeparture: "2026-11-10T07:00" }, ctx);
    expect(find(a, "db-comp")!.status).toBe("not_eligible");
  });
  it("voluntary surrender is informational only", () => {
    const a = evaluateIndia({ ...db, deniedVoluntary: true }, ctx);
    expect(find(a, "db-vol")!.status).toBe("info");
  });
});

describe("delay duty of care", () => {
  const d = { ...base, disruptionType: "delay" as const };
  it("meals at 2h for short block, refund option beyond 6h", () => {
    const a = evaluateIndia({ ...d, actualDeparture: "2026-11-10T12:40" }, ctx);
    expect(a.delayMinutes).toBe(390);
    expect(a.dutyOfCare.some((x) => x.includes("meals"))).toBe(true);
    expect(find(a, "delay-refund")!.status).toBe("eligible");
  });
  it("hotel for >6h delay on a night departure", () => {
    const a = evaluateIndia({ ...d, scheduledDeparture: "2026-11-10T22:00", scheduledArrival: "2026-11-11T00:15", actualDeparture: "2026-11-11T05:00" }, ctx);
    expect(a.dutyOfCare.some((x) => x.includes("Hotel"))).toBe(true);
  });
  it("no meal entitlement below threshold", () => {
    const a = evaluateIndia({ ...d, actualDeparture: "2026-11-10T07:30" }, ctx);
    expect(a.dutyOfCare).toHaveLength(0);
  });
});

describe("baggage", () => {
  const b = { ...base, disruptionType: "baggage" as const, origin: "DXB", destination: "BOM", scheduledDeparture: "2026-11-10T09:00", scheduledArrival: "2026-11-10T13:40" };
  it("7-day damage notice deadline from receipt", () => {
    const a = evaluateIndia({ ...b, baggageIssue: "damaged", baggageReceivedOn: "2026-11-10", baggageClaimAmount: 15000 }, ctx);
    expect(a.isInternational).toBe(true);
    expect(a.deadlines.find((x) => x.id === "bag-7d")!.due).toBe("2026-11-17");
    expect(find(a, "bag-claim")!.amount).toEqual({ min: 15000, max: 15000 });
  });
  it("21-day delay notice deadline", () => {
    const a = evaluateIndia({ ...b, baggageIssue: "delayed", baggageReceivedOn: "2026-11-12" }, ctx);
    expect(a.deadlines.find((x) => x.id === "bag-21d")!.due).toBe("2026-12-03");
  });
  it("caps at 1,519 SDR", () => {
    const a = evaluateIndia({ ...b, baggageIssue: "lost", baggageClaimAmount: 900000 }, ctx);
    expect(find(a, "bag-claim")!.amount!.max).toBe(1519 * 120);
  });
  it("warns when notice window has passed", () => {
    const a = evaluateIndia({ ...b, baggageIssue: "damaged", baggageReceivedOn: "2026-11-01" }, ctx);
    expect(find(a, "bag-late")).toBeDefined();
  });
  it("flags missing PIR", () => {
    const a = evaluateIndia({ ...b, baggageIssue: "damaged", baggageReceivedOn: "2026-11-10" }, ctx);
    expect(a.evidence.find((e) => e.id === "pir")!.provided).toBe(false);
  });
});

describe("refund", () => {
  const r = { ...base, disruptionType: "refund" as const, refundRequestedOn: "2026-10-01", refundReceived: false, refundAmountPending: 7200 };
  it("card refund due in 7 days; overdue triggers chargeback", () => {
    const a = evaluateIndia(r, ctx);
    expect(a.deadlines.find((x) => x.id === "refund-due")!.due).toBe("2026-10-08");
    expect(find(a, "refund")!.title).toBe("Refund overdue");
    expect(find(a, "chargeback")).toBeDefined();
    expect(a.estimate).toEqual({ min: 7200, max: 7200 });
  });
  it("agent booking gets 30 working days", () => {
    const a = evaluateIndia({ ...r, bookingChannel: "agent" }, ctx);
    expect(a.deadlines.find((x) => x.id === "refund-due")!.due).toBe("2026-11-12");
  });
});

describe("connections & limitation", () => {
  it("single PNR missed connection is airline liability", () => {
    const a = evaluateIndia({ ...base, disruptionType: "delay", actualDeparture: "2026-11-10T09:00", missedConnection: true, singlePnr: true }, ctx);
    expect(find(a, "mct")!.status).toBe("eligible");
  });
  it("separate PNR routes to insurance", () => {
    const a = evaluateIndia({ ...base, disruptionType: "delay", actualDeparture: "2026-11-10T09:00", missedConnection: true, singlePnr: false }, ctx);
    expect(find(a, "mct")!.status).toBe("info");
  });
  it("e-Jagriti limitation is 2 years", () => {
    const a = evaluateIndia({ ...base, cancellationNoticeHours: 5 }, ctx);
    expect(a.deadlines.find((x) => x.id === "ejagriti")!.due).toBe("2028-11-10");
  });
});

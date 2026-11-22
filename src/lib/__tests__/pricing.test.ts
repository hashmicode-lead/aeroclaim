import { describe, expect, it } from "vitest";
import { payoutSplit, qualifyNoWin } from "../pricing";
import { evaluateIndia } from "../rules/india";
import type { ClaimInput } from "../types";

const base: ClaimInput = {
  passengerName: "Asha Rao",
  pnr: "X7K2QP",
  airline: "IndiGo",
  flightNumber: "6E2134",
  origin: "DEL",
  destination: "BOM",
  scheduledDeparture: "2026-11-10T06:10",
  scheduledArrival: "2026-11-10T08:25",
  disruptionType: "cancellation",
  airlineReason: "operational",
  bookingChannel: "airline",
  paymentMethod: "credit_card",
  cancellationNoticeHours: 4,
  basicFarePlusFuel: 9000,
};
const ctx = { today: "2026-11-12", weather: null, documents: [{ kind: "e_ticket" as const }, { kind: "airline_notice" as const }] };

describe("no-win-no-fee qualification", () => {
  it("accepts a clear, well-evidenced cancellation claim", () => {
    const q = qualifyNoWin(evaluateIndia(base, ctx));
    expect(q.qualifies).toBe(true);
    expect(q.score).toBeGreaterThanOrEqual(70);
  });

  it("rejects a contestable weather claim", () => {
    const a = evaluateIndia({ ...base, airlineReason: "weather" }, { ...ctx, weather: { checkedAt: "", overall: "severe", verdict: "", airports: [] } });
    const q = qualifyNoWin(a);
    expect(q.qualifies).toBe(false);
    expect(q.reasons.join(" ")).toMatch(/extraordinary|strength/);
  });

  it("rejects small claims", () => {
    const q = qualifyNoWin(evaluateIndia({ ...base, basicFarePlusFuel: 3000 }, ctx));
    expect(q.qualifies).toBe(false);
    expect(q.reasons[0]).toMatch(/under ₹5,000/);
  });

  it("splits 15% normally and 25% when escalated", () => {
    expect(payoutSplit(10000)).toEqual({ pct: 15, fee: 1500, youGet: 8500 });
    expect(payoutSplit(10000, true)).toEqual({ pct: 25, fee: 2500, youGet: 7500 });
  });
});

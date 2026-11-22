import type { Assessment } from "./types";

/**
 * No-win-no-fee guardrails. The success-fee track is only offered on claims we expect to win,
 * so losing claims don't eat the margin. Everything else is steered to the paid self-file kit.
 */
export const FEES = {
  standardPct: 15, // settled by airline / insurer / card issuer
  escalatedPct: 25, // needed a consumer-commission filing
  diyKit: 299,
  withdrawalFee: 499, // customer withdraws after filing, or accepts payment directly and doesn't pay our share
  minClaimInr: 5000, // below this the fee can't cover handling cost
  minScore: 70, // claim strength needed for no-win-no-fee
};

export interface Qualification {
  score: number; // 0–100 claim strength
  qualifies: boolean;
  reasons: string[]; // why it doesn't qualify (empty when it does)
  strengths: string[];
}

const RISK_PENALTY = { low: 0, medium: 15, high: 35 } as const;

/** Score a claim from the rule engine's own output. Pure, so it's unit-tested. */
export function qualifyNoWin(a: Pick<Assessment, "findings" | "estimate" | "extraordinaryRisk" | "evidence">): Qualification {
  const money = a.findings.filter((f) => f.amount && (f.status === "eligible" || f.status === "likely"));
  const eligible = money.filter((f) => f.status === "eligible").length;
  const likely = money.filter((f) => f.status === "likely").length;
  const missing = a.evidence.filter((e) => e.required && !e.provided).length;
  const needsInfo = a.findings.filter((f) => f.status === "needs_info").length;

  let score = 45;
  score += Math.min(eligible, 3) * 20; // clear statutory entitlements carry most weight
  score += Math.min(likely, 3) * 7;
  score -= RISK_PENALTY[a.extraordinaryRisk];
  score -= Math.min(missing, 4) * 6;
  score -= needsInfo * 8;
  if (a.estimate.max > 0 && a.estimate.min / a.estimate.max >= 0.8) score += 8; // little of the value is contestable
  score = Math.max(0, Math.min(100, Math.round(score)));

  const reasons: string[] = [];
  if (a.estimate.max < FEES.minClaimInr) reasons.push(`The claim is under ₹${FEES.minClaimInr.toLocaleString("en-IN")}, too small for the success-fee track.`);
  if (score < FEES.minScore) reasons.push(`Claim strength is ${score}/100; we take success-fee cases from ${FEES.minScore}.`);
  if (a.extraordinaryRisk === "high") reasons.push("The airline has a strong 'extraordinary circumstances' defence.");
  if (missing > 2) reasons.push(`${missing} required documents are missing.`);

  const strengths: string[] = [];
  if (eligible) strengths.push(`${eligible} clear statutory entitlement${eligible > 1 ? "s" : ""}`);
  if (a.extraordinaryRisk === "low") strengths.push("Airline's excuse is weak");
  if (missing === 0) strengths.push("All required evidence provided");

  return { score, qualifies: reasons.length === 0, reasons, strengths };
}

/** What the customer keeps on each track. */
export function payoutSplit(amount: number, escalated = false) {
  const pct = escalated ? FEES.escalatedPct : FEES.standardPct;
  const fee = Math.round((amount * pct) / 100);
  return { pct, fee, youGet: amount - fee };
}

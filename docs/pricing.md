# No win, no fee: how we avoid losing money

The success-fee track only works if the claims we take mostly win. A losing claim earns nothing and still costs us handling time, follow-ups and sometimes an escalation. These rules keep the track profitable. They live in `src/lib/pricing.ts` and are covered by `src/lib/__tests__/pricing.test.ts`.

## The rules

| Rule | Value | Why |
| --- | --- | --- |
| Claim-strength score needed | 70 / 100 | Only take claims we expect to win |
| Minimum claim value | ₹5,000 | Below this, 15% doesn't cover handling cost |
| Standard fee | 15% | Settled by airline, insurer or card issuer |
| Escalated fee | 25% | Consumer-commission filing needed (more work) |
| Withdrawal / direct-settlement fee | Our fee or ₹499, whichever is higher | Stops customers dropping out after we've done the work, or taking the airline's payment directly |
| Everyone else | ₹299 self-file kit | Paid upfront, so risky or small claims still make money |

## How the score works

Computed from the rule engine's own output, with no manual review:

- Starts at 45.
- +20 for each clear statutory entitlement (up to three), +7 for each contestable one.
- −15 or −35 if the airline has a medium or strong "extraordinary circumstances" defence (weather, ATC, strike).
- −6 for each missing required document, −8 for each missing fact.
- +8 if little of the claim's value is contestable.

A late cancellation caused by an operational problem, with the ticket and the airline's SMS, scores about 73 and qualifies. The same flight cancelled in genuinely severe weather scores below 30 and is offered the kit instead.

## Unit economics (illustrative)

Assumptions: average claim ₹12,000; handling cost ₹150 per claim; escalation cost ₹600 on 30% of claims.

| | Win rate | Fee earned per claim | Cost per claim | Margin per claim |
| --- | --- | --- | --- | --- |
| Take every claim | ~40% | 0.40 × ₹1,800 = ₹720 | ₹330 | ₹390, thin and exposed to bad claims |
| Take only score ≥ 70 | ~85% | 0.85 × ₹1,800 = ₹1,530 | ₹330 | ₹1,200 |

Turning claims away from the fee track isn't lost revenue: those customers buy the ₹299 kit, which has almost no marginal cost.

## Other protections already in the product

- **Advocates pay us** (₹499–₹999 per lead). We never pay lawyers to take long shots.
- **Escalate only when worth it**: consumer-commission filings carry the 25% fee, and the score already predicts the outcome.
- **Letter of Authority**: lets us receive the payout directly and take our share before paying the customer, so we're never chasing fees.
- **Card-insurance claims** are paperwork-only and cheap to file, so they lift the win amount without much cost.

## Tuning

Change `FEES.minScore` or `FEES.minClaimInr` in `src/lib/pricing.ts`. Once real outcomes exist, recalibrate the score weights so that claims scoring 70+ actually win at least 80% of the time.

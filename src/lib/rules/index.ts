import type { Assessment, ClaimInput } from "../types";
import { indiaPack } from "./india";
import type { RuleContext, RulePack } from "./pack";

/** Registered jurisdiction packs, most specific first. Add EU261 etc. here. */
export const RULE_PACKS: RulePack[] = [indiaPack];

export function assess(input: ClaimInput, ctx: RuleContext): Assessment {
  const pack = RULE_PACKS.find((p) => p.appliesTo(input)) ?? indiaPack;
  return pack.evaluate(input, ctx);
}

export type { RuleContext, RulePack };

import type { Assessment, ClaimInput, DocKind, WeatherReport } from "../types";

export interface RuleContext {
  /** Today's date (YYYY-MM-DD) in the pack's reference timezone. */
  today: string;
  weather: WeatherReport | null;
  documents: { kind: DocKind }[];
}

/**
 * A jurisdiction rule pack. New frameworks (e.g. EU261) implement this interface
 * and register in `rules/index.ts` without touching intake, packets or the UI.
 */
export interface RulePack {
  id: string;
  name: string;
  appliesTo(input: ClaimInput): boolean;
  evaluate(input: ClaimInput, ctx: RuleContext): Assessment;
}

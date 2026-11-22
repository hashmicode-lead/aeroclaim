/**
 * Card network names shown in the product. These are placeholder brands: real network names and
 * logos are trademarks and need a licence. Change them here and every screen follows.
 */
export const NETWORKS = {
  wise: { name: "Wise", tiers: ["Classic", "Gold", "Platinum"] },
  naster: { name: "Naster", tiers: ["Standard", "Titanium", "Platinum", "Elite"] },
} as const;

export type NetworkId = keyof typeof NETWORKS;

export const NETWORK_PAIR = `${NETWORKS.wise.name} or ${NETWORKS.naster.name}`;

/** Detect the network from the card number's leading digits (4… and 5…/2… ranges). */
export function detectNetwork(num: string): NetworkId | null {
  const d = num.replace(/\D/g, "");
  if (/^4/.test(d)) return "wise";
  if (/^5[1-5]/.test(d) || /^2(2[2-9][1-9]|2[3-9]\d|[3-6]\d\d|7[01]\d|720)/.test(d)) return "naster";
  return null;
}

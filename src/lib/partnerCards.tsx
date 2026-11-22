/**
 * Partner cards we recommend for travel cover. Banks and cards are fictional placeholders;
 * swap in real affiliate partners (and their approved logos) once agreements are signed.
 * Each `applyUrl` would be the partner's tracked affiliate link that earns a referral commission.
 */
export interface PartnerCard {
  id: string;
  bank: string;
  card: string;
  monogram: string;
  hue: string;
  network: "Wise" | "Naster";
  annualFee: string;
  travelCover: string;
  highlights: string[];
  bestFor: string;
  applyUrl: string;
  featured?: boolean;
}

export const PARTNER_CARDS: PartnerCard[] = [
  {
    id: "northstar-voyager",
    bank: "Northstar Bank",
    card: "Voyager Card",
    monogram: "N",
    hue: "#0b3d91",
    network: "Wise",
    annualFee: "₹2,500 (waived on ₹3 lakh yearly spend)",
    travelCover: "Up to ₹10 lakh",
    highlights: ["Trip delay ₹15,000 after 6 hours", "Lost baggage up to ₹1,00,000", "8 domestic lounge visits a year"],
    bestFor: "Frequent flyers",
    applyUrl: "#apply-northstar",
    featured: true,
  },
  {
    id: "kaveri-altitude",
    bank: "Kaveri Bank",
    card: "Altitude Card",
    monogram: "K",
    hue: "#a4123f",
    network: "Naster",
    annualFee: "₹999",
    travelCover: "Up to ₹5 lakh",
    highlights: ["Baggage delay ₹10,000 after 8 hours", "Missed connection ₹10,000", "1% fuel surcharge waiver"],
    bestFor: "Occasional travellers",
    applyUrl: "#apply-kaveri",
  },
  {
    id: "saffron-jetset",
    bank: "Saffron Bank",
    card: "Jetset Card",
    monogram: "S",
    hue: "#d26a00",
    network: "Wise",
    annualFee: "Lifetime free",
    travelCover: "Up to ₹2 lakh",
    highlights: ["Lost baggage up to ₹50,000", "No joining fee", "5% back on flight bookings"],
    bestFor: "First credit card",
    applyUrl: "#apply-saffron",
  },
];

export function BankMark({ card, size = 26 }: { card: PartnerCard; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-[7px] font-bold text-white"
      style={{ width: size, height: size, background: card.hue, fontSize: size * 0.5 }}
      aria-label={card.bank}
      title={card.bank}
    >
      {card.monogram}
    </span>
  );
}

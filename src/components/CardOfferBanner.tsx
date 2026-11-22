import Link from "next/link";
import { BankMark, PARTNER_CARDS } from "@/lib/partnerCards";

/** Slim offer strip in the style of a retail promo bar. Links to the recommended-cards page. */
export function CardOfferBanner() {
  return (
    <div className="no-print border-b border-line bg-surface-2">
      <Link
        href="/cards/recommended"
        className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-3 text-center transition-opacity hover:opacity-80"
      >
        <span className="footnote max-w-xl text-ink">
          Get complimentary travel insurance worth up to ₹10 lakh<sup className="text-muted">◊</sup> when you book flights with eligible partner cards.{" "}
          <span className="font-medium whitespace-nowrap text-accent">See eligible cards ›</span>
        </span>
        <span className="flex items-center gap-3" aria-label="Partner banks">
          {PARTNER_CARDS.map((c) => <BankMark key={c.id} card={c} size={24} />)}
        </span>
      </Link>
    </div>
  );
}

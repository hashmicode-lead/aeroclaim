import Link from "next/link";
import { Logo } from "./Logo";

const COLUMNS: { title: string; links: { label: string; href: string; external?: boolean }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Start a claim", href: "/claims/new" },
      { label: "Card cover check", href: "/cards" },
      { label: "Recommended cards", href: "/cards/recommended" },
      { label: "For travellers", href: "/for/travellers" },
      { label: "For business", href: "/for/businesses" },
      { label: "For advocates", href: "/for/advocates" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/about#careers" },
      { label: "Press", href: "/about#press" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of service", href: "/legal/terms" },
      { label: "Privacy policy", href: "/legal/privacy" },
      { label: "Refund policy", href: "/legal/refunds" },
      { label: "Grievance officer", href: "/legal/grievance" },
    ],
  },
  {
    title: "Passenger rights",
    links: [
      { label: "DGCA passenger charter", href: "https://www.civilaviation.gov.in/", external: true },
      { label: "AirSewa", href: "https://airsewa.gov.in/", external: true },
      { label: "e-Jagriti", href: "https://e-jagriti.gov.in/", external: true },
      { label: "Insurance Ombudsman", href: "https://www.cioins.co.in/", external: true },
    ],
  },
];

export function Footer() {
  return (
    <footer className="no-print mt-20 border-t border-line bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div>
            <Link href="/" aria-label="AeroClaim home" className="flex items-center">
              <Logo size={24} />
            </Link>
            <p className="footnote mt-3 max-w-xs text-muted">Flight delay, cancellation, baggage and refund claims for Indian travellers, prepared in minutes.</p>
          </div>
          {COLUMNS.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h2 className="caption font-semibold text-ink">{c.title}</h2>
              <ul className="mt-3 space-y-2">
                {c.links.map((l) => (
                  <li key={l.label}>
                    {l.external ? (
                      <a href={l.href} target="_blank" rel="noreferrer" className="footnote text-muted transition-colors hover:text-ink">{l.label} ↗</a>
                    ) : (
                      <Link href={l.href} className="footnote text-muted transition-colors hover:text-ink">{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 border-t border-line pt-6">
          <p className="caption max-w-3xl text-muted">
            AeroClaim OS is a claim-preparation platform, not a law firm, and does not give legal advice. Formal representation is provided only by independent advocates enrolled with a State Bar Council. Estimates are based on DGCA CAR Section 3 Series M, the Montreal Convention as applied by the Carriage by Air Act, 1972, and the Consumer Protection Act, 2019.
          </p>
          <div className="caption mt-4 flex flex-wrap items-center justify-between gap-3 text-muted">
            <span>© 2026 AeroClaim Technologies Pvt Ltd · Bengaluru, India</span>
            <span className="flex gap-4">
              <Link href="/legal/privacy" className="hover:text-ink">Privacy</Link>
              <Link href="/legal/terms" className="hover:text-ink">Terms</Link>
              <Link href="/contact" className="hover:text-ink">Contact</Link>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

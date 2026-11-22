import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "AeroClaim OS", template: "%s · AeroClaim OS" },
  description: "Recover flight compensation, stuck refunds and baggage claims in India: DGCA, Montreal Convention and consumer-law guidance.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className="h-full">
      <body className="flex min-h-full flex-col">
        <header className="no-print chrome edge-fade sticky top-0 z-40">
          <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-1.5 text-[15px] font-semibold tracking-[-0.02em]">
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden className="text-accent">
                <path fill="currentColor" d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
              </svg>
              AeroClaim
            </Link>
            <nav className="flex items-center gap-1 text-[13px]">
              <Link href="/claims" className="rounded-full px-3 py-1.5 text-ink/80 transition-colors hover:text-ink">My Claims</Link>
              <Link href="/claims/new" className="btn-primary px-3.5! py-1! text-[13px]!">New Claim</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="no-print mt-16 border-t border-line py-8">
          <div className="footnote mx-auto max-w-5xl px-4 text-muted">
            AeroClaim OS automates claim preparation. It is not a law firm and does not give legal advice. Assessments are estimates
            based on DGCA CAR Section 3 Series M, the Montreal Convention and the Consumer Protection Act, 2019. Check them against the current
            text, and talk to a qualified advocate about contested claims.
          </div>
        </footer>
      </body>
    </html>
  );
}

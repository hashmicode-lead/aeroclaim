import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "AeroClaim OS", template: "%s · AeroClaim OS" },
  description: "Recover flight compensation, stuck refunds and baggage claims in India: DGCA, Montreal Convention and consumer-law guidance.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header className="no-print border-b border-line bg-surface/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden className="text-accent">
                <path fill="currentColor" d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
              </svg>
              AeroClaim <span className="text-muted font-normal">OS</span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link href="/claims" className="rounded-md px-3 py-1.5 text-muted hover:bg-surface-2 hover:text-ink">My claims</Link>
              <Link href="/claims/new" className="btn-primary py-1.5!">New claim</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="no-print border-t border-line py-6 text-xs text-muted">
          <div className="mx-auto max-w-5xl px-4">
            AeroClaim OS automates claim preparation. It is not a law firm and does not give legal advice. Assessments are estimates
            based on DGCA CAR Section 3 Series M, the Montreal Convention and the Consumer Protection Act, 2019. Check them against the current text,
            and talk to a qualified advocate about contested claims.
          </div>
        </footer>
      </body>
    </html>
  );
}

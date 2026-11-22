import type { Metadata, Viewport } from "next";
import { NavBar } from "@/components/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "AeroClaim OS", template: "%s · AeroClaim OS" },
  description: "Recover flight compensation, stuck refunds and baggage claims in India: DGCA, Montreal Convention and consumer-law guidance.",
};

export const viewport: Viewport = {
  themeColor: "#f5f5f7",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className="h-full">
      <body className="flex min-h-full flex-col">
        <NavBar />
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

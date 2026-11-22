import Link from "next/link";
import { notFound } from "next/navigation";

const DOCS: Record<string, { title: string; updated: string; sections: [string, string][] }> = {
  terms: {
    title: "Terms of service",
    updated: "1 November 2026",
    sections: [
      ["What we do", "AeroClaim prepares claims, letters and filing packets for air-travel disruptions. We are not a law firm and do not give legal advice. Formal representation is provided only by independent advocates you choose to engage."],
      ["Your account", "You must give accurate information about your flights and keep your login secure. You can close your account at any time from settings."],
      ["Fees", "On the No win, no fee plan we keep 15% of any amount recovered through our filings. The Self-file kit is a one-time ₹299 payment. Business and advocate plans are billed as shown on the pricing sheet."],
      ["Letter of Authority", "If you sign a Letter of Authority, we act on your behalf with the airline, card issuer and insurer for the claim named in it. You can revoke it before settlement."],
      ["Liability", "Estimates depend on the information you give and on the current regulations. We do not guarantee any outcome."],
    ],
  },
  privacy: {
    title: "Privacy policy",
    updated: "1 November 2026",
    sections: [
      ["What we collect", "Your name and contact details, flight and booking details, the documents you upload, and the last four digits of any card you add. We never ask for a card's full number for storage, its CVV or your banking password."],
      ["Why", "Only to prepare and pursue your claims, send deadline reminders and pay out recovered amounts."],
      ["Consent and your rights", "We process your data with your consent under the Digital Personal Data Protection Act, 2023. You can access, correct or erase your data, or withdraw consent, at any time."],
      ["Sharing", "We share claim documents only with the airline, card network, insurer, regulator portal or advocate involved in your claim. We do not sell personal data. Sponsored insurance offers are shown without sharing your data with the advertiser."],
      ["Security", "Documents are encrypted at rest and in transit. Access is limited to staff working on your claim."],
    ],
  },
  refunds: {
    title: "Refund policy",
    updated: "1 November 2026",
    sections: [
      ["Self-file kit", "If you haven't downloaded any packet, we refund the ₹299 in full within 7 days of purchase."],
      ["Success fees", "Charged only on amounts actually received. If an airline later reverses a payment, we refund our share of it."],
      ["Business plans", "Monthly plans can be cancelled at any time and stop at the end of the billing month. We don't refund partial months."],
    ],
  },
  grievance: {
    title: "Grievance officer",
    updated: "1 November 2026",
    sections: [
      ["Contact", "Grievance Officer, AeroClaim Technologies Pvt Ltd, Indiranagar, Bengaluru 560038 · grievance@aeroclaim.example"],
      ["Timelines", "We acknowledge every grievance within 24 hours and resolve it within 15 days, as required by the Information Technology (Intermediary Guidelines) Rules, 2021."],
      ["Escalation", "If you're not satisfied, you can approach the Data Protection Board of India for data matters, or the consumer commission for service matters."],
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(DOCS).map((slug) => ({ slug }));
}

export default async function LegalPage({ params }: PageProps<"/legal/[slug]">) {
  const { slug } = await params;
  const doc = DOCS[slug];
  if (!doc) notFound();
  return (
    <div className="reveal mx-auto max-w-2xl px-4 py-16">
      <nav className="footnote flex flex-wrap gap-x-4 gap-y-1 text-muted" aria-label="Legal documents">
        {Object.entries(DOCS).map(([k, d]) => (
          <Link key={k} href={`/legal/${k}`} className={k === slug ? "font-semibold text-ink" : "hover:text-ink"}>{d.title}</Link>
        ))}
      </nav>
      <h1 className="title-1 mt-8">{doc.title}</h1>
      <p className="footnote mt-1 text-muted">Last updated {doc.updated}</p>
      <div className="mt-8 space-y-7">
        {doc.sections.map(([h, b]) => (
          <section key={h}>
            <h2 className="headline">{h}</h2>
            <p className="mt-1.5 text-ink/80">{b}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

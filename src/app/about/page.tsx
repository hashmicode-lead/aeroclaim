import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About us" };

const VALUES = [
  { t: "Cite the rule", d: "Every rupee we ask for comes with the clause behind it. Airlines settle faster when the law is on the page." },
  { t: "Check the excuse", d: "We test 'bad weather' against hourly airport weather before anyone accepts it." },
  { t: "Paid when you are", d: "Our main plan costs nothing upfront. We earn a share only when you recover." },
];

const TEAM = [
  { n: "Product & engineering", d: "Rule engine, document reading and the claim workflow." },
  { n: "Regulatory research", d: "DGCA CARs, the Montreal Convention and consumer case law, kept current." },
  { n: "Partnerships", d: "Card networks, insurers and the advocates who take contested cases." },
];

export default function AboutPage() {
  return (
    <div className="reveal mx-auto max-w-3xl px-4 py-16">
      <p className="eyebrow">About us</p>
      <h1 className="title-1 mt-2 text-balance">Air passengers in India are owed more than they ever claim.</h1>
      <p className="mt-4 text-muted">
        DGCA rules guarantee compensation for late cancellations and denied boarding, refunds within fixed deadlines, and baggage payouts under the Montreal Convention. Most travellers never use these rights. The rules are hard to find, the deadlines are short, and the paperwork is slow. AeroClaim turns a ticket and an airline SMS into a complete, cited claim in minutes.
      </p>

      <h2 className="title-2 mt-12">What we believe</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {VALUES.map((v) => (
          <div key={v.t} className="card p-5">
            <div className="headline">{v.t}</div>
            <p className="footnote mt-1 text-muted">{v.d}</p>
          </div>
        ))}
      </div>

      <h2 id="careers" className="title-2 mt-12 scroll-mt-20">Team and careers</h2>
      <ul className="card mt-4 divide-y divide-line">
        {TEAM.map((t) => (
          <li key={t.n} className="p-5">
            <div className="headline">{t.n}</div>
            <p className="footnote mt-0.5 text-muted">{t.d}</p>
          </li>
        ))}
      </ul>
      <p className="footnote mt-3 text-muted">We&apos;re hiring in Bengaluru. Write to careers@aeroclaim.example with what you&apos;d like to work on.</p>

      <h2 id="press" className="title-2 mt-12 scroll-mt-20">Press</h2>
      <p className="mt-2 text-muted">For interviews and data on flight disruption in India, write to press@aeroclaim.example.</p>

      <div className="mt-12 flex gap-3">
        <Link href="/signup" className="btn-primary">Create free account</Link>
        <Link href="/contact" className="btn-ghost">Contact us</Link>
      </div>
    </div>
  );
}

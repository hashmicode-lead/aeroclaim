import {
  BadgeCheck,
  BarChart3,
  Bell,
  Briefcase,
  CalendarClock,
  CloudSun,
  CreditCard,
  FileCheck2,
  FileSpreadsheet,
  Gavel,
  Luggage,
  Lock,
  Plane,
  Receipt,
  Scale,
  ShieldCheck,
  Users,
  Video,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CardOfferBanner } from "@/components/CardOfferBanner";
import { ClientStories } from "@/components/ClientStories";
import { notFound } from "next/navigation";

type Audience = "travellers" | "businesses" | "advocates";

interface PageData {
  title: string;
  eyebrow: string;
  headline: string;
  sub: string;
  Icon: LucideIcon;
  cta: string;
  stats: { v: string; k: string }[];
  features: { Icon: LucideIcon; t: string; d: string }[];
  steps: { t: string; d: string }[];
  plans: { name: string; price: string; unit: string; points: string[]; featured?: boolean }[];
  faq: { q: string; a: string }[];
  note?: string;
}

const PAGES: Record<Audience, PageData> = {
  travellers: {
    title: "For travellers",
    eyebrow: "For travellers",
    headline: "Get back what the airline owes you.",
    sub: "Delayed, cancelled, bumped, a damaged bag or a refund that never arrived. Tell us what happened and we work out what you're owed, why, and how to get it.",
    Icon: Plane,
    cta: "Sign up free",
    stats: [
      { v: "Up to ₹10,000", k: "for a late cancellation" },
      { v: "Up to ₹20,000", k: "if you're bumped" },
      { v: "Up to ₹1.8 lakh", k: "for a lost or damaged bag" },
    ],
    features: [
      { Icon: FileCheck2, t: "Your exact entitlement", d: "Every amount comes with the DGCA or Montreal Convention rule behind it, so the airline can't brush it off." },
      { Icon: CloudSun, t: "The weather excuse, tested", d: "We check hourly weather at both airports. If the skies were clear, your claim says so." },
      { Icon: CalendarClock, t: "Deadlines you can't miss", d: "7 days for a damaged bag, 21 days for a late one. We add every deadline to your calendar." },
      { Icon: CreditCard, t: "Your card can pay too", d: "Paid by card? We check its travel cover and file that claim alongside the airline's." },
      { Icon: Receipt, t: "Letters ready to send", d: "A formal notice to the airline, plus AirSewa and consumer-court drafts if it comes to that." },
      { Icon: Wallet, t: "Paid to your UPI", d: "On the success-fee plan, the money comes to us and goes straight on to you, minus our share." },
    ],
    steps: [
      { t: "Add your flight", d: "Upload the ticket, boarding pass or the airline's SMS. We read the details for you." },
      { t: "See what you're owed", d: "Get the amount, the rules behind it and the deadlines, in under a minute." },
      { t: "Choose how to claim", d: "Let us file it for you, or download the self-file kit and send it yourself." },
      { t: "Get paid", d: "Track every reply. Most airline claims settle within 30 days." },
    ],
    plans: [
      { name: "No win, no fee*", price: "₹0 upfront", unit: "15% only if we win", points: ["We file and chase everything", "25% only if it goes to the consumer commission", "Nothing to pay if you don't recover"], featured: true },
      { name: "Self-file kit", price: "₹299", unit: "one-time, per claim", points: ["Every letter and packet, ready to send", "Step-by-step filing guide", "Keep 100% of the payout"] },
    ],
    faq: [
      { q: "Do I need a lawyer?", a: "No. Most claims are settled by the airline after a formal written notice, which we prepare for you. If a claim needs the consumer commission, you can consult a verified advocate in the app." },
      { q: "The airline said it was bad weather. Can I still claim?", a: "Often, yes. We check recorded weather at both airports. Even when the weather was genuinely bad, the airline still owes you meals, a hotel if needed, and a refund or another flight." },
      { q: "How old can the flight be?", a: "Consumer complaints can be filed within 2 years of the flight. Baggage complaints have much shorter windows of 7 and 21 days, so add those quickly." },
      { q: "What does it cost?", a: "Self-filing costs ₹299. With no win, no fee you pay nothing upfront and 15% only if you recover, for claims that pass our eligibility check." },
    ],
    note: "*No win, no fee is offered after we check your claim's risk. Depending on that check, the fee can change or we may offer the self-file kit instead.",
  },
  businesses: {
    title: "For businesses",
    eyebrow: "For businesses",
    headline: "Recover the travel spend your company is owed.",
    sub: "Every month, delayed flights, unused tickets and refunds that never arrive quietly cost your travel budget. AeroClaim audits every employee booking and recovers it.",
    Icon: Briefcase,
    cta: "Start a 14-day trial",
    stats: [
      { v: "1,284", k: "PNRs audited for a typical mid-size team each quarter" },
      { v: "₹6.4 lakh", k: "found in one quarter for a sample customer" },
      { v: "1 afternoon", k: "to audit a full year of bookings" },
    ],
    features: [
      { Icon: FileSpreadsheet, t: "Bulk PNR upload", d: "Drop in your travel desk's CSV or Excel export. We match employees, flights and fares automatically." },
      { Icon: BarChart3, t: "Recovery dashboard", d: "See recoverable value, pending refunds and settled claims across the company at a glance." },
      { Icon: Receipt, t: "Refund and chargeback tracking", d: "Overdue refunds are flagged on day 8 for cards and day 31 for agents, with chargeback packets ready." },
      { Icon: Users, t: "Team access", d: "Invite finance and travel-desk colleagues with the right permissions for each." },
      { Icon: FileCheck2, t: "Finance-ready reports", d: "Monthly recovery reports for your books, with every claim and its status." },
      { Icon: Lock, t: "Private by design", d: "Documents are encrypted and processed under the DPDP Act. Employees' data is never shared with advertisers." },
    ],
    steps: [
      { t: "Upload your bookings", d: "Export from your travel desk or agency portal and upload the file." },
      { t: "We audit every PNR", d: "Delays, cancellations, unused tickets and overdue refunds are found and valued." },
      { t: "Approve the claims", d: "Pick which claims to file. We prepare and send every notice on your company's behalf." },
      { t: "Money comes back", d: "Recovered amounts are credited to your company's travel account, with a report for finance." },
    ],
    plans: [
      { name: "Corporate", price: "₹4,999", unit: "per month", points: ["Unlimited PNR audits", "Bulk upload and team access", "Refund, chargeback and recovery reports"], featured: true },
      { name: "Enterprise", price: "Custom", unit: "annual contract", points: ["SSO and role-based access", "API access to the rules engine", "Dedicated claims manager"] },
    ],
    faq: [
      { q: "Do employees have to do anything?", a: "No. Claims are filed in the company's name using the booking data you upload. Employees are only contacted if a document such as a baggage report is missing." },
      { q: "Which travel desks and agencies do you support?", a: "Any that can export bookings to CSV or Excel. We map the columns for you on the first upload." },
      { q: "Who receives the money?", a: "Your company. Refunds go back to the original payment method, and compensation is paid to the account you nominate." },
      { q: "Can we cancel any time?", a: "Yes. Monthly plans stop at the end of the billing month." },
    ],
  },
  advocates: {
    title: "For advocates",
    eyebrow: "For advocates",
    headline: "Verified consumer cases, ready to take on.",
    sub: "Travellers with contested claims above ₹50,000 can choose a verified advocate on AeroClaim. Each case arrives with the evidence checked, the rules applied and the chronology written.",
    Icon: Scale,
    cta: "Join as an advocate",
    stats: [
      { v: "₹50,000+", k: "minimum claim value for a case listing" },
      { v: "₹499–₹999", k: "per case you choose to unlock" },
      { v: "Under 1 day", k: "Bar Council verification" },
    ],
    features: [
      { Icon: BadgeCheck, t: "Evidence already checked", d: "Boarding passes, PIRs, receipts and the airline's replies, indexed and ready." },
      { Icon: CloudSun, t: "Weather certificate", d: "Hourly airport weather around the flight, to answer an 'extraordinary circumstances' defence." },
      { Icon: Gavel, t: "Draft consumer complaint", d: "A deficiency-in-service brief with chronology and annexure index, formatted for e-Jagriti." },
      { Icon: Video, t: "In-browser video consults", d: "Meet the traveller in a secure video room with the case file shared on screen." },
      { Icon: CalendarClock, t: "Your calendar, your hours", d: "Set the slots travellers can book. Reminders go out automatically." },
      { Icon: Bell, t: "Cases near you", d: "Get notified when a verified case in your city matches your practice areas." },
    ],
    steps: [
      { t: "Verify your enrolment", d: "Enter your State Bar Council enrolment number. We confirm it with the issuing council." },
      { t: "Set up your profile", d: "Practice areas, city, languages and your consultation fee." },
      { t: "Review case summaries", d: "See anonymised summaries of cases where travellers have asked for an advocate." },
      { t: "Unlock and consult", d: "Unlock a case to see the full file and contact details, then meet by video." },
    ],
    plans: [
      { name: "Pay per case", price: "₹499–₹999", unit: "per case unlocked", points: ["No subscription", "Full evidence bundle on unlock", "Video consult room included"], featured: true },
      { name: "Advocate Pro", price: "₹2,499", unit: "per month", points: ["10 case unlocks included", "Priority on cases over ₹1 lakh", "Booking page for your calendar"] },
    ],
    faq: [
      { q: "Is this compatible with the Bar Council rules on advertising?", a: "AeroClaim does not advertise or solicit work for you. Travellers choose to request an advocate, and you choose which cases to take. Your profile shows only the factual details the rules permit." },
      { q: "How is verification done?", a: "We check your enrolment number with the issuing State Bar Council before any case is shown to you." },
      { q: "Who sets the fee for the case itself?", a: "You do, directly with the client. AeroClaim charges only the unlock fee, never a share of your professional fees." },
      { q: "What kinds of cases come through?", a: "Mostly flight cancellations, denied boarding, baggage loss or damage and long-delayed refunds, where the airline has refused or ignored a formal notice." },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(PAGES).map((audience) => ({ audience }));
}

export async function generateMetadata({ params }: PageProps<"/for/[audience]">): Promise<Metadata> {
  const { audience } = await params;
  const p = PAGES[audience as Audience];
  return p ? { title: p.title, description: p.sub } : {};
}

export default async function AudiencePage({ params }: PageProps<"/for/[audience]">) {
  const { audience } = await params;
  const p = PAGES[audience as Audience];
  if (!p) notFound();
  const signupHref = `/signup?as=${audience}`;

  return (
    <>
    {audience === "travellers" && <CardOfferBanner />}
    <div className="mx-auto max-w-5xl px-5 pb-8 sm:px-6">
      {/* Hero */}
      <section className="reveal pt-16 pb-12 text-center sm:pt-24">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <p.Icon size={26} aria-hidden />
        </span>
        <p className="headline mt-5 text-accent">{p.eyebrow}</p>
        <h1 className="display mx-auto mt-2 max-w-3xl text-balance">{p.headline}</h1>
        <p className="title-2 mx-auto mt-5 max-w-2xl font-normal! text-balance text-muted">{p.sub}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <Link href={signupHref} className="btn-primary px-6! py-3! text-[17px]! bg-[#0066CC] hover:bg-[#005bb5]">{p.cta}</Link>
          <Link href="/login" className="text-[17px] text-accent hover:underline">Log in <span aria-hidden>›</span></Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-3 sm:grid-cols-3" aria-label="At a glance">
        {p.stats.map((s) => (
          <div key={s.k} className="card scroll-rise p-6 text-center">
            <div className="title-1 text-accent tabular-nums">{s.v}</div>
            <div className="footnote mt-1 text-muted">{s.k}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="mt-24 sm:mt-32" aria-labelledby="features-title">
        <h2 id="features-title" className="title-1 scroll-rise text-center">What you get</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {p.features.map((f) => (
            <div key={f.t} className="card scroll-rise p-6">
              <f.Icon size={22} className="text-accent" aria-hidden />
              <div className="headline mt-4">{f.t}</div>
              <p className="footnote mt-1 text-muted">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="mt-24 sm:mt-32" aria-labelledby="steps-title">
        <h2 id="steps-title" className="title-1 scroll-rise text-center">How it works</h2>
        <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {p.steps.map((s, i) => (
            <li key={s.t} className="card scroll-rise p-6">
              <span className="flex size-8 items-center justify-center rounded-full bg-accent text-[14px] font-semibold text-white">{i + 1}</span>
              <div className="headline mt-4">{s.t}</div>
              <p className="footnote mt-1 text-muted">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Pricing */}
      <section className="mt-24 sm:mt-32" aria-labelledby="pricing-title">
        <h2 id="pricing-title" className="title-1 scroll-rise text-center">Pricing</h2>
        <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
          {p.plans.map((pl) => (
            <div key={pl.name} className={`card scroll-rise flex flex-col p-6 ${pl.featured ? "shadow-[inset_0_0_0_2px_var(--accent),var(--shadow-card)]" : ""}`}>
              <div className="headline">{pl.name}</div>
              <div className="mt-3 flex flex-wrap items-baseline gap-2">
                <span className="title-1 tabular-nums">{pl.price}</span>
                <span className="footnote text-muted">{pl.unit}</span>
              </div>
              <ul className="mt-4 flex-1 space-y-2">
                {pl.points.map((x) => (
                  <li key={x} className="footnote flex gap-2"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-ok" aria-hidden />{x}</li>
                ))}
              </ul>
              <Link href={signupHref} className={`${pl.featured ? "btn-primary" : "btn-ghost"} mt-6 w-full py-2.5!`}>
                {pl.featured ? p.cta : (
                  audience === "travellers" ? "Get the kit" :
                  audience === "businesses" ? "Talk to sales" :
                  "Go Pro"
                )}
              </Link>
            </div>
          ))}
        </div>
        {p.note && <p className="caption mx-auto mt-4 max-w-3xl text-center text-muted">{p.note}</p>}
      </section>

      {audience === "travellers" && <ClientStories />}

      {/* FAQ */}
      <section className="mx-auto mt-24 max-w-3xl sm:mt-32" aria-labelledby="faq-title">
        <h2 id="faq-title" className="title-1 scroll-rise text-center">Questions</h2>
        <div className="card mt-8 divide-y divide-line">
          {p.faq.map((f) => (
            <details key={f.q} className="group px-6 py-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="headline flex cursor-pointer list-none items-center justify-between gap-4">
                {f.q}
                <span className="text-xl leading-none text-muted transition-transform duration-200 group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="footnote mt-2 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="card scroll-rise mt-24 sm:mt-32 flex flex-col items-center gap-4 p-10 text-center">
        <Luggage size={28} className="text-accent" aria-hidden />
        <h2 className="title-1 text-balance">Ready when you are.</h2>
        <Link href={signupHref} className="btn-primary px-6! py-3! text-[17px]! bg-[#0066CC] hover:bg-[#005bb5]">{p.cta}</Link>
      </section>
    </div>
    </>
  );
}

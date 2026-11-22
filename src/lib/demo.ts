/**
 * Demo dataset. Every screen in the demo journey reads from here so the numbers agree everywhere.
 * Scenario: AI 161 DEL→LHR delayed 6h 20m (airline said fog; Open-Meteo shows clear sky),
 * two checked bags: one damaged, one delivered late. Primary card: Wise Platinum (placeholder network name).
 */

export const DEMO_ID = "demo";

export const demoUser = {
  name: "Ananya Sharma",
  email: "ananya.sharma@example.com",
  phone: "+91 98XXX 41207",
  upi: "ananya@okhdfc",
  cardTier: "Wise Platinum",
  initials: "AS",
};

export const demoClaim = {
  id: DEMO_ID,
  ref: "AC-2026-08492",
  pnr: "K4TQ7M",
  bookingType: "Single PNR",
  airline: "Air India",
  flight: "AI 161",
  origin: { iata: "DEL", city: "Delhi" },
  dest: { iata: "LHR", city: "London" },
  date: "2026-11-19",
  scheduled: "02:15",
  actual: "08:35",
  delayMinutes: 380,
  excuse: "Dense fog at Delhi (weather)",
  pirNumber: "LHRAI48213",
  card: "Wise Platinum ···· 4821",
  passengers: 2,
  status: "Evidence verified",
};

export const demoWeather = {
  verdict: "Clear sky",
  airport: "DEL",
  window: "23:15 – 05:15 IST, 18–19 Nov",
  summary: "Visibility stayed above 4.8 km and winds were calm all night. No fog was recorded in the six hours around departure.",
  hours: [
    { t: "23:00", cond: "Clear sky", vis: 6.1, wind: 4, precip: 0 },
    { t: "00:00", cond: "Clear sky", vis: 5.8, wind: 3, precip: 0 },
    { t: "01:00", cond: "Mainly clear", vis: 5.4, wind: 3, precip: 0 },
    { t: "02:00", cond: "Mainly clear", vis: 5.1, wind: 2, precip: 0 },
    { t: "03:00", cond: "Clear sky", vis: 4.8, wind: 2, precip: 0 },
    { t: "04:00", cond: "Clear sky", vis: 5.2, wind: 3, precip: 0 },
    { t: "05:00", cond: "Clear sky", vis: 5.9, wind: 4, precip: 0 },
  ],
};

export const demoDeadlines = [
  { id: "d7", title: "Damaged bag: written complaint", due: "2026-11-26", basis: "Montreal Convention, Art. 31(2): 7 days from receipt", hard: true },
  { id: "d21", title: "Delayed bag: written complaint", due: "2026-12-12", basis: "Montreal Convention, Art. 31(2): 21 days from delivery", hard: true },
  { id: "airsewa", title: "Escalate to AirSewa if no reply", due: "2026-12-22", basis: "30 days after the nodal notice", hard: false },
  { id: "cpa", title: "Consumer complaint limitation", due: "2028-11-19", basis: "Consumer Protection Act, 2019, s. 69", hard: true },
];

export const demoBreakdown = [
  { track: "Airline", label: "Damaged suitcase and contents", basis: "Airline pays up to about ₹1.8 lakh per passenger · Montreal Convention Art. 17(2)", inr: 118400 },
  { track: "Airline", label: "Essentials bought while the second bag was delayed", basis: "Montreal Convention Art. 19", inr: 30000 },
  { track: "Airline", label: "6h 20m delay: meals and lounge not provided", basis: "DGCA CAR Sec 3 Series M Part IV para 3.4, plus CPA 2019 deficiency in service", inr: 10000 },
  { track: "Card", label: "Wise Platinum baggage-delay & trip-delay cover", basis: "Card insurance top-up (cover begins after 6 hours)", inr: 24000 },
];

export const demoTotal = demoBreakdown.reduce((s, b) => s + b.inr, 0); // 1,82,400

export const feeModels = {
  noWin: { pct: 15, fee: Math.round(demoTotal * 0.15), youGet: demoTotal - Math.round(demoTotal * 0.15) },
  diy: { price: 299 },
};

export const packets = [
  { type: "nodal", title: "Airline nodal notice", desc: "Formal demand to Air India's nodal officer, citing the CAR and Montreal Convention clauses.", pages: 3 },
  { type: "airsewa", title: "AirSewa grievance summary", desc: "Pre-filled summary with the Open-Meteo weather certificate attached.", pages: 2 },
  { type: "ejagriti", title: "e-Jagriti consumer brief", desc: "Deficiency-in-service complaint, chronology and an indexed annexure bundle.", pages: 6 },
  { type: "chargeback", title: "Card insurance & chargeback", desc: "Wise Platinum card claim pack: PIR, delay certificate and itemised receipts.", pages: 4 },
] as const;

export type PacketType = (typeof packets)[number]["type"];

export const timeline = [
  { label: "Evidence verified", date: "20 Nov", done: true },
  { label: "Sent to airline nodal officer", date: "21 Nov", done: true },
  { label: "Insurance top-up filed", date: "21 Nov", done: true },
  { label: "AirSewa escalation", date: "If no reply by 22 Dec", done: false },
  { label: "Settlement received", date: "-", done: false },
  { label: "Payout to UPI", date: "-", done: false },
];

export const myClaims = [
  { id: DEMO_ID, route: "Delhi → London", flight: "AI 161", type: "Delay + baggage", amount: 182400, status: "Sent to airline", tone: "info" as const, date: "19 Nov 2026" },
  { id: "c-2", route: "Mumbai → Bengaluru", flight: "6E 5312", type: "Cancellation", amount: 7500, status: "Settled", tone: "ok" as const, date: "02 Oct 2026" },
  { id: "c-3", route: "Kochi → Dubai", flight: "IX 435", type: "Refund stuck", amount: 21850, status: "Chargeback filed", tone: "warn" as const, date: "14 Sep 2026" },
];

export const corporate = {
  company: "Northwind Analytics Pvt Ltd",
  plan: "Corporate · ₹4,999/mo",
  kpis: [
    { label: "Recoverable this quarter", value: "₹6,48,200" },
    { label: "PNRs audited", value: "1,284" },
    { label: "Refunds pending", value: "37" },
    { label: "Recovered to date", value: "₹11,92,750" },
  ],
  rows: [
    { emp: "Rohan Mehta", dept: "Sales", pnr: "Q8LZ2N", flight: "6E 2134 DEL–BOM", issue: "Cancelled <24h", amount: 10000, status: "Claim sent" },
    { emp: "Priya Nair", dept: "Engineering", pnr: "J3KD9P", flight: "AI 504 BLR–DEL", issue: "Refund overdue 41 days", amount: 14620, status: "Chargeback ready" },
    { emp: "Arjun Rao", dept: "Finance", pnr: "M7TR4C", flight: "UK 945 BOM–DXB", issue: "Bag delayed 3 days", amount: 28400, status: "Awaiting PIR" },
    { emp: "Sneha Iyer", dept: "Marketing", pnr: "B2WX6H", flight: "QP 1407 BLR–GOI", issue: "Denied boarding", amount: 9800, status: "Settled" },
    { emp: "Karan Singh", dept: "Sales", pnr: "T5NV8Q", flight: "SG 8169 DEL–CCU", issue: "Delay 5h 10m", amount: 0, status: "Meals only" },
    { emp: "Meera Pillai", dept: "Operations", pnr: "H9PL3S", flight: "AI 131 BOM–LHR", issue: "Unused ticket", amount: 46200, status: "Refund requested" },
  ],
};

export const leads = [
  { id: "L-2291", title: "Damaged international baggage + 6h delay", route: "DEL → LHR", value: 182400, fee: 999, city: "Delhi", verified: true, age: "12 min ago" },
  { id: "L-2287", title: "Denied boarding, no alternate offered", route: "BOM → SIN", value: 64000, fee: 799, city: "Mumbai", verified: true, age: "1 h ago" },
  { id: "L-2279", title: "Refund stuck 94 days via OTA", route: "BLR → DXB", value: 58250, fee: 499, city: "Bengaluru", verified: true, age: "3 h ago" },
  { id: "L-2270", title: "Lost bag, family of four", route: "COK → DOH", value: 171900, fee: 999, city: "Kochi", verified: false, age: "Yesterday" },
];

export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

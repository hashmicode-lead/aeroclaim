import { BrandMark, type BrandId } from "./BrandMark";

const PARTNERS: { id: BrandId; name: string; kind: string }[] = [
  { id: "zbi", name: "ZBI", kind: "Bank" },
  { id: "ibibi", name: "IBIBI", kind: "Bank" },
  { id: "oxis", name: "OXIS", kind: "Bank" },
  { id: "ztar", name: "Ztar Health", kind: "Insurance" },
  { id: "mivapupa", name: "Miva Pupa", kind: "Insurance" },
  { id: "fbi", name: "FBI Health", kind: "Insurance" },
];

/** Card and insurance partners whose cover we check on every company booking. Placeholder brands. */
export function PartnerStrip() {
  return (
    <section aria-labelledby="partners-title" className="card mt-6 px-6 py-8 sm:px-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="partners-title" className="title-2">Our <span className="text-accent">Partners</span></h2>
        <p className="footnote text-muted">Card and travel-insurance cover we check on every company booking.</p>
      </div>
      <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {PARTNERS.map((p) => (
          <li key={p.id} className="scroll-rise flex items-center gap-3 rounded-2xl bg-fill px-3 py-3">
            <BrandMark id={p.id} size={34} title={p.name} />
            <span className="min-w-0">
              <span className="footnote block truncate font-semibold">{p.name}</span>
              <span className="caption block text-muted">{p.kind}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

import { Building2, Cpu, Factory, Hotel, Landmark, Leaf, Pill, Plane, Radio, Ship, Truck, Zap, type LucideIcon } from "lucide-react";

/**
 * Client logo wall for the corporate area. These are fictional sample companies with original
 * wordmarks. Only list a real company here once it is an actual client and has agreed to be shown.
 */
type Style = "caps" | "serif" | "light" | "black" | "mono" | "wide";
interface Client {
  name: string;
  tag?: string;
  Icon: LucideIcon;
  style: Style;
}

export const CLIENTS: Client[] = [
  { name: "Contoso India", tag: "Technology", Icon: Cpu, style: "black" },
  { name: "FABRIKAM", tag: "Logistics", Icon: Truck, style: "wide" },
  { name: "Northwind", tag: "Analytics", Icon: Zap, style: "light" },
  { name: "Woodgrove", tag: "Finance", Icon: Landmark, style: "serif" },
  { name: "TAILSPIN", tag: "Air services", Icon: Plane, style: "caps" },
  { name: "adatum", tag: "Pharma", Icon: Pill, style: "mono" },
  { name: "Wingtip", tag: "Hotels & resorts", Icon: Hotel, style: "serif" },
  { name: "LITWARE", tag: "Systems", Icon: Building2, style: "wide" },
  { name: "Proseware", tag: "Media", Icon: Radio, style: "black" },
  { name: "Bluewater", tag: "Shipping", Icon: Ship, style: "light" },
  { name: "GREENLEAF", tag: "Foods", Icon: Leaf, style: "caps" },
  { name: "Alpine Ski", tag: "Manufacturing", Icon: Factory, style: "mono" },
];

const STYLE: Record<Style, string> = {
  caps: "text-[15px] font-bold tracking-[0.12em]",
  serif: "font-[Georgia,'Times_New_Roman',serif] text-[18px] italic",
  light: "text-[18px] font-light tracking-tight",
  black: "text-[17px] font-black tracking-[-0.04em]",
  mono: "font-mono text-[16px] font-semibold lowercase",
  wide: "text-[14px] font-medium tracking-[0.28em]",
};

export function ClientWall() {
  return (
    <section aria-labelledby="clients-title" className="mt-16 overflow-hidden rounded-3xl bg-[#0b0b0c] px-6 py-12 text-white sm:px-10">
      <div className="text-center">
        <h2 id="clients-title" className="title-1">
          Our <span className="text-[#ffd60a]">Clients</span>
        </h2>
        <p className="footnote mt-2 text-white/60">Travel desks across India recover delayed and unused travel spend with AeroClaim.</p>
      </div>
      <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
        {CLIENTS.map(({ name, tag, Icon, style }) => (
          <li key={name} className="scroll-rise flex flex-col items-center justify-center text-center opacity-80 transition-opacity hover:opacity-100">
            <span className="flex items-center gap-1.5">
              <Icon size={18} strokeWidth={2} aria-hidden />
              <span className={STYLE[style]}>{name}</span>
            </span>
            {tag && <span className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/50">{tag}</span>}
          </li>
        ))}
      </ul>
      <p className="caption mt-10 text-center text-white/40">Sample client names for this demo.</p>
    </section>
  );
}

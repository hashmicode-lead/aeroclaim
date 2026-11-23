"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { inr } from "@/lib/demo";

/**
 * Customer stories. These are fictional sample customers: replace each one with a real,
 * approved quote (and photo, with written consent) before using this in marketing.
 */
const STORIES = [
  {
    name: "Rohan Mehta",
    role: "Head of Admin, Contoso India",
    initials: "RM",
    hue: "#0066cc",
    recovered: 648200,
    quote:
      "Our travel desk books 400 flights a month and nobody had time to chase refunds. AeroClaim went through a year of PNRs in one afternoon and found money we'd written off.",
  },
  {
    name: "Priya Nair",
    role: "Travel Manager, Fabrikam Logistics",
    initials: "PN",
    hue: "#6d28d9",
    recovered: 182400,
    quote:
      "A cancelled Delhi–Mumbai flight used to mean an angry email and nothing else. Now the letter cites the exact DGCA clause, and the airline pays within the month.",
  },
  {
    name: "Arjun Rao",
    role: "Finance Lead, Northwind Analytics",
    initials: "AR",
    hue: "#0f766e",
    recovered: 92750,
    quote:
      "The weather check is the part I show people. The airline blamed fog; the data showed clear skies. That one screen settled the claim.",
  },
  {
    name: "Meera Pillai",
    role: "Frequent flyer, Kochi",
    initials: "MP",
    hue: "#ea580c",
    recovered: 48600,
    quote:
      "My bag came back from Dubai with a cracked shell. AeroClaim reminded me about the 7-day deadline, drafted the complaint, and my card insurance paid on top of the airline.",
  },
];

export function ClientStories() {
  const track = useRef<HTMLUListElement>(null);
  const scroll = (dir: number) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector("li");
    el.scrollBy({ left: dir * ((card?.clientWidth ?? 300) + 16), behavior: "smooth" });
  };

  return (
    <section aria-labelledby="stories-title" className="mt-16">
      <div className="flex flex-wrap items-end justify-between gap-4 px-1">
        <div>
          <h2 id="stories-title" className="title-1">
            <span className="text-accent">Client</span> Stories
          </h2>
          <div className="mt-3 h-0.5 w-10 rounded-full bg-accent" aria-hidden />
        </div>
        <div className="flex gap-2">
          <button aria-label="Previous stories" onClick={() => scroll(-1)} className="pressable flex size-9 items-center justify-center rounded-full bg-fill text-accent hover:bg-surface-2">
            <ChevronLeft size={18} aria-hidden />
          </button>
          <button aria-label="More stories" onClick={() => scroll(1)} className="pressable flex size-9 items-center justify-center rounded-full bg-fill text-accent hover:bg-surface-2">
            <ChevronRight size={18} aria-hidden />
          </button>
        </div>
      </div>

      <ul ref={track} className="mt-5 -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pt-1 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {STORIES.map((s) => (
          <li key={s.name} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]">
            <figure className="card flex h-full flex-col p-6">
              <span className="font-[Georgia,serif] text-5xl leading-none text-accent" aria-hidden>&ldquo;</span>
              <blockquote className="footnote mt-2 flex-1 text-ink/85">{s.quote}</blockquote>
              <div className="mt-5 rounded-xl bg-fill px-3 py-2">
                <span className="caption text-muted">Recovered</span>{" "}
                <span className="footnote font-semibold text-ok tabular-nums">{inr(s.recovered)}</span>
              </div>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full text-[14px] font-semibold text-white" style={{ background: s.hue }} aria-hidden>
                  {s.initials}
                </span>
                <span>
                  <span className="headline block">{s.name}</span>
                  <span className="caption block text-muted">{s.role}</span>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <p className="caption mt-2 px-1 text-muted">Sample customer stories for this demo.</p>
    </section>
  );
}

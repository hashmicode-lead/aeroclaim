"use client";

import { CalendarDays, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const pad = (n: number) => String(n).padStart(2, "0");
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

function label(value: string, withTime: boolean) {
  if (!value) return "";
  const [d, t] = value.split("T");
  const [y, m, day] = d.split("-").map(Number);
  const date = `${day} ${MONTHS[m - 1].slice(0, 3)} ${y}`;
  return withTime && t ? `${date}, ${t}` : date;
}

/**
 * Apple-style date (and optional time) field. Value format matches the native inputs:
 * `YYYY-MM-DD`, or `YYYY-MM-DDTHH:mm` with `withTime`.
 */
export function DateTimeField({
  id,
  value,
  onChange,
  withTime = false,
  placeholder = "Select date",
  invalid = false,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  withTime?: boolean;
  placeholder?: string;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const [datePart, timePart = "09:00"] = (value || "").split("T");
  const base = datePart || todayStr();
  const [view, setView] = useState(() => ({ y: Number(base.slice(0, 4)), m: Number(base.slice(5, 7)) - 1 }));

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const emit = (d: string, t: string) => onChange(withTime ? `${d}T${t}` : d);
  const first = new Date(view.y, view.m, 1);
  const lead = (first.getDay() + 6) % 7; // Monday first
  const count = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  const today = todayStr();
  const [hh, mm] = timePart.split(":");

  const shift = (delta: number) =>
    setView((v) => {
      const m = v.m + delta;
      return { y: v.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 };
    });

  return (
    <div className="relative" ref={root}>
      <button
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`field flex items-center gap-2 text-left ${open ? "border-accent! bg-surface! shadow-[0_0_0_4px_var(--accent-soft)]" : ""} ${invalid ? "border-bad!" : ""}`}
      >
        <CalendarDays size={17} className="shrink-0 text-muted" aria-hidden />
        <span className={`truncate ${value ? "" : "text-muted/60"}`}>{label(value, withTime) || placeholder}</span>
      </button>

      {open && (
        <div role="dialog" aria-label="Choose date" className="reveal absolute left-0 z-40 mt-2 w-[300px] max-w-[calc(100vw-2rem)] rounded-2xl bg-surface p-4 shadow-[var(--shadow-raised)] ring-1 ring-line">
          <div className="flex items-center justify-between">
            <span className="headline">{MONTHS[view.m]} {view.y}</span>
            <div className="flex gap-1">
              <button type="button" aria-label="Previous month" onClick={() => shift(-1)} className="pressable flex size-8 items-center justify-center rounded-full text-accent hover:bg-fill"><ChevronLeft size={18} aria-hidden /></button>
              <button type="button" aria-label="Next month" onClick={() => shift(1)} className="pressable flex size-8 items-center justify-center rounded-full text-accent hover:bg-fill"><ChevronRight size={18} aria-hidden /></button>
            </div>
          </div>
          <div className="caption mt-3 grid grid-cols-7 text-center font-semibold text-muted">
            {DAYS.map((d) => <span key={d} className="py-1">{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5 text-center">
            {cells.map((d, i) => {
              if (!d) return <span key={`e${i}`} />;
              const ds = `${view.y}-${pad(view.m + 1)}-${pad(d)}`;
              const sel = ds === datePart;
              const isToday = ds === today;
              return (
                <button
                  key={ds}
                  type="button"
                  aria-label={`${d} ${MONTHS[view.m]} ${view.y}`}
                  aria-pressed={sel}
                  onClick={() => {
                    emit(ds, timePart);
                    if (!withTime) setOpen(false);
                  }}
                  className={`mx-auto flex size-9 items-center justify-center rounded-full text-[15px] transition-colors ${sel ? "bg-accent font-semibold text-white" : isToday ? "font-semibold text-accent hover:bg-fill" : "hover:bg-fill"}`}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {withTime && (
            <div className="mt-3 border-t border-line pt-3">
              <div className="flex items-center justify-between">
                <span className="footnote flex items-center gap-1.5 font-medium"><Clock size={15} className="text-muted" aria-hidden /> Time</span>
                <div className="flex items-center gap-1 rounded-lg bg-fill p-0.5">
                  <select aria-label="Hour" value={hh} onChange={(e) => emit(datePart || today, `${e.target.value}:${mm}`)} className="rounded-md bg-surface px-2 py-1 text-[15px] tabular-nums shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-accent">
                    {Array.from({ length: 24 }, (_, h) => <option key={h} value={pad(h)}>{pad(h)}</option>)}
                  </select>
                  <span className="font-semibold">:</span>
                  <select aria-label="Minute" value={mm} onChange={(e) => emit(datePart || today, `${hh}:${e.target.value}`)} className="rounded-md bg-surface px-2 py-1 text-[15px] tabular-nums shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-accent">
                    {Array.from({ length: 60 }, (_, m) => <option key={m} value={pad(m)}>{pad(m)}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <button type="button" className="footnote text-accent hover:underline" onClick={() => { emit(today, timePart); setView({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 }); }}>
              Today
            </button>
            <div className="flex gap-3">
              {value && <button type="button" className="footnote text-muted hover:text-ink" onClick={() => { onChange(""); setOpen(false); }}>Clear</button>}
              <button type="button" className="footnote font-semibold text-accent" onClick={() => setOpen(false)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

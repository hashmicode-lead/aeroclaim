import type { ClaimRecord } from "./types";

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** Fold long lines at 75 octets per RFC 5545. */
function fold(line: string): string {
  const out: string[] = [];
  let s = line;
  while (s.length > 74) {
    out.push(s.slice(0, 74));
    s = " " + s.slice(74);
  }
  out.push(s);
  return out.join("\r\n");
}

export function buildIcs(claim: ClaimRecord, baseUrl: string): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//AeroClaim OS//Deadlines//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
  for (const d of claim.assessment.deadlines.filter((d) => d.kind === "passenger")) {
    const date = d.due.replace(/-/g, "");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${claim.id}-${d.id}@aeroclaim`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${date}`,
      `SUMMARY:${esc(`${d.hard ? "DEADLINE" : "Reminder"}: ${d.title} (${claim.input.flightNumber} / ${claim.input.pnr})`)}`,
      `DESCRIPTION:${esc(`${d.description}\nBasis: ${d.basis}\n${baseUrl}/claims/${claim.id}`)}`,
      `URL:${baseUrl}/claims/${claim.id}`,
      "BEGIN:VALARM", "ACTION:DISPLAY", "TRIGGER:-P3D", `DESCRIPTION:${esc(d.title)} in 3 days`, "END:VALARM",
      "BEGIN:VALARM", "ACTION:DISPLAY", "TRIGGER:-P1D", `DESCRIPTION:${esc(d.title)} tomorrow`, "END:VALARM",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

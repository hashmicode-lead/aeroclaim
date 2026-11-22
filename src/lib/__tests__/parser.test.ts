import { describe, expect, it } from "vitest";
import { parseBcbp, parseText } from "../parser";
import { classifyHour } from "../weather";
import { addWorkingDays, zonedToUtc } from "../time";

describe("parser", () => {
  it("extracts fields from an airline cancellation SMS", () => {
    const r = parseText("Dear Customer, your IndiGo flight 6E 2134 DEL-BOM on 14 Dec 2026 at 06:10 has been cancelled due to operational reasons. PNR: X7K2QP");
    expect(r.fields).toMatchObject({
      pnr: "X7K2QP",
      flightNumber: "6E2134",
      airline: "IndiGo",
      origin: "DEL",
      destination: "BOM",
      scheduledDeparture: "2026-12-14T06:10",
      disruptionType: "cancellation",
      airlineReason: "operational",
    });
    expect(r.kind).toBe("airline_notice");
    expect(r.missing).toEqual([]);
  });

  it("reads a PIR reference", () => {
    const r = parseText("Property Irregularity Report. File Reference: DELAI12345. Bag tag AI 123456");
    expect(r.fields.pirNumber).toBe("DELAI12345");
    expect(r.kind).toBe("pir");
  });

  it("parses an IATA BCBP boarding-pass barcode", () => {
    const raw = "M1RAO/ASHA            EX7K2QP DELBOM6E 2134 318Y012A0001 100";
    const f = parseBcbp(raw, 2026)!;
    expect(f).toMatchObject({ pnr: "X7K2QP", origin: "DEL", destination: "BOM", flightNumber: "6E2134", airline: "IndiGo", passengerName: "Asha Rao" });
    expect(f.scheduledDeparture).toBe("2026-11-14T00:00");
  });
});

describe("weather classification", () => {
  const nil = { code: null, visibilityM: null, gustKmh: null, windKmh: null, precipMm: null };
  it("dense fog is severe", () => expect(classifyHour({ ...nil, code: 45, visibilityM: 200 }).severity).toBe("severe"));
  it("thunderstorm is severe", () => expect(classifyHour({ ...nil, code: 95 }).severity).toBe("severe"));
  it("haze at 1.2 km is moderate", () => expect(classifyHour({ ...nil, code: 3, visibilityM: 1200 }).severity).toBe("moderate"));
  it("clear sky is none", () => expect(classifyHour({ ...nil, code: 0, visibilityM: 10000, gustKmh: 20 }).severity).toBe("none"));
});

describe("time", () => {
  it("converts IST wall time to UTC", () => expect(zonedToUtc("2026-11-10T06:10", "Asia/Kolkata").toISOString()).toBe("2026-11-10T00:40:00.000Z"));
  it("skips weekends for working days", () => expect(addWorkingDays("2026-11-13", 1)).toBe("2026-11-16"));
});

import { getAirport } from "./airports";
import { addDays, datePart, daysUntil, minutesBetweenWall, todayIST } from "./time";
import type { AirportWeather, ClaimInput, WeatherHour, WeatherReport, WeatherSeverity } from "./types";

const WMO: Record<number, string> = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Depositing rime fog",
  51: "Light drizzle", 53: "Drizzle", 55: "Dense drizzle", 56: "Freezing drizzle", 57: "Dense freezing drizzle",
  61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain", 66: "Freezing rain", 67: "Heavy freezing rain",
  71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow", 77: "Snow grains",
  80: "Rain showers", 81: "Moderate rain showers", 82: "Violent rain showers", 85: "Snow showers", 86: "Heavy snow showers",
  95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with heavy hail",
};

const SEVERE_CODES = new Set([65, 66, 67, 75, 82, 86, 95, 96, 99]);
const MODERATE_CODES = new Set([45, 48, 57, 63, 73, 81, 85]);

/** Hours either side of the scheduled time to inspect. */
export const WINDOW_HOURS = 3;

export function classifyHour(h: {
  code: number | null;
  visibilityM: number | null;
  gustKmh: number | null;
  windKmh: number | null;
  precipMm: number | null;
}): { severity: "none" | "moderate" | "severe"; reasons: string[] } {
  const severe: string[] = [];
  const moderate: string[] = [];
  if (h.code !== null && SEVERE_CODES.has(h.code)) severe.push(WMO[h.code]);
  else if (h.code !== null && MODERATE_CODES.has(h.code)) moderate.push(WMO[h.code]);
  if (h.visibilityM !== null) {
    if (h.visibilityM < 550) severe.push(`visibility ${Math.round(h.visibilityM)} m (below CAT I minima)`);
    else if (h.visibilityM < 1500) moderate.push(`visibility ${Math.round(h.visibilityM)} m`);
  }
  if (h.gustKmh !== null) {
    if (h.gustKmh >= 65) severe.push(`gusts ${Math.round(h.gustKmh)} km/h`);
    else if (h.gustKmh >= 45) moderate.push(`gusts ${Math.round(h.gustKmh)} km/h`);
  }
  if (h.precipMm !== null) {
    if (h.precipMm >= 15) severe.push(`${h.precipMm} mm/h rain`);
    else if (h.precipMm >= 7.5) moderate.push(`${h.precipMm} mm/h rain`);
  }
  if (severe.length) return { severity: "severe", reasons: [...severe, ...moderate] };
  if (moderate.length) return { severity: "moderate", reasons: moderate };
  return { severity: "none", reasons: [] };
}

const RANK: Record<WeatherSeverity, number> = { unavailable: -1, none: 0, moderate: 1, severe: 2 };

function pickEndpoint(date: string, today: string): { url: string; visibility: boolean; label: string } | null {
  const delta = daysUntil(date, today);
  if (delta > 15) return null;
  if (delta >= -60) return { url: "https://api.open-meteo.com/v1/forecast", visibility: true, label: "Open-Meteo forecast API" };
  if (date >= "2022-01-01") return { url: "https://historical-forecast-api.open-meteo.com/v1/forecast", visibility: true, label: "Open-Meteo historical forecast API" };
  return { url: "https://archive-api.open-meteo.com/v1/archive", visibility: false, label: "Open-Meteo ERA5 archive" };
}

async function airportWeather(code: string, around: string, role: AirportWeather["role"], today: string): Promise<AirportWeather> {
  const ap = getAirport(code);
  const base = { airport: code, role, around, hours: [] as WeatherHour[] };
  if (!ap) return { ...base, severity: "unavailable", summary: "Airport not in the database.", source: "-" };
  const date = datePart(around);
  const ep = pickEndpoint(date, today);
  if (!ep) return { ...base, severity: "unavailable", summary: "This flight is too far ahead for a forecast.", source: "-" };

  const vars = ["weather_code", "wind_speed_10m", "wind_gusts_10m", "precipitation", ...(ep.visibility ? ["visibility"] : [])];
  const params = new URLSearchParams({
    latitude: String(ap.lat),
    longitude: String(ap.lon),
    hourly: vars.join(","),
    start_date: addDays(date, -1),
    end_date: addDays(date, 1),
    timezone: ap.tz,
  });
  try {
    const res = await fetch(`${ep.url}?${params}`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { hourly?: Record<string, (number | null)[] | string[]> };
    const hourly = data.hourly;
    if (!hourly?.time) throw new Error("No hourly data");
    const times = hourly.time as string[];
    const hours: WeatherHour[] = [];
    times.forEach((t, i) => {
      const diff = minutesBetweenWall(around, t);
      if (Math.abs(diff) > WINDOW_HOURS * 60) return;
      const num = (k: string) => {
        const v = (hourly[k] as (number | null)[] | undefined)?.[i];
        return typeof v === "number" ? v : null;
      };
      const h = {
        code: num("weather_code"),
        visibilityM: num("visibility"),
        windKmh: num("wind_speed_10m"),
        gustKmh: num("wind_gusts_10m"),
        precipMm: num("precipitation"),
      };
      const c = classifyHour(h);
      hours.push({ time: t, ...h, description: h.code !== null ? (WMO[h.code] ?? `Code ${h.code}`) : "-", ...c });
    });
    if (!hours.length) throw new Error("No data in window");
    const worst = hours.reduce<WeatherSeverity>((w, h) => (RANK[h.severity] > RANK[w] ? h.severity : w), "none");
    const reasons = [...new Set(hours.flatMap((h) => h.reasons))];
    const summary =
      worst === "none"
        ? `No significant adverse weather within ±${WINDOW_HOURS}h of ${around.slice(11)} local.`
        : `${worst === "severe" ? "Severe" : "Marginal"} conditions within ±${WINDOW_HOURS}h: ${reasons.slice(0, 4).join(", ")}.`;
    return { ...base, hours, severity: worst, summary, source: ep.label };
  } catch (e) {
    return { ...base, severity: "unavailable", summary: "Weather data could not be fetched.", source: ep.label, error: e instanceof Error ? e.message : String(e) };
  }
}

export function weatherVerdict(overall: WeatherSeverity, reason: ClaimInput["airlineReason"]): string {
  if (overall === "unavailable") return "No weather data was available. Rely on the airline's written explanation and flight-status records.";
  if (overall === "severe") return "Adverse weather was recorded near the scheduled times. A weather explanation is plausible.";
  if (overall === "moderate") return "Only marginal weather was recorded. It may not justify the disruption. Ask the airline for specifics.";
  return reason === "weather"
    ? "No significant adverse weather was recorded at either airport. The airline's weather explanation is not supported by the data."
    : "No significant adverse weather was recorded at either airport, which points to a cause within the airline's control.";
}

export async function checkWeather(input: ClaimInput, now: Date = new Date()): Promise<WeatherReport> {
  const today = todayIST(now);
  const checks = [airportWeather(input.origin, input.scheduledDeparture, "departure", today)];
  if (input.scheduledArrival) checks.push(airportWeather(input.destination, input.scheduledArrival, "arrival", today));
  const airports = await Promise.all(checks);
  const overall = airports.reduce<WeatherSeverity>((w, a) => (RANK[a.severity] > RANK[w] ? a.severity : w), "unavailable");
  return { checkedAt: now.toISOString(), overall, verdict: weatherVerdict(overall, input.airlineReason), airports };
}

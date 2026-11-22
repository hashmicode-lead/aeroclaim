import { getClaim, updateAssessment } from "@/lib/db";
import { assess } from "@/lib/rules";
import { todayIST } from "@/lib/time";
import { checkWeather } from "@/lib/weather";

/** Re-run the weather check and rule engine, e.g. after a weather API outage or as deadlines move. */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const claim = await getClaim(id);
  if (!claim) return Response.json({ error: "Not found" }, { status: 404 });
  const weather = ["delay", "cancellation"].includes(claim.input.disruptionType) ? await checkWeather(claim.input) : null;
  const assessment = assess(claim.input, { today: todayIST(), weather, documents: claim.documents });
  await updateAssessment(id, assessment, weather);
  return Response.json({ ok: true });
}

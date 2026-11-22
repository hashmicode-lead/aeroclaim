import { getClaim } from "@/lib/db";
import { buildIcs } from "@/lib/ics";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const claim = await getClaim(id);
  if (!claim) return new Response("Not found", { status: 404 });
  const base = new URL(request.url).origin;
  return new Response(buildIcs(claim, base), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="aeroclaim-${claim.input.pnr}-deadlines.ics"`,
    },
  });
}

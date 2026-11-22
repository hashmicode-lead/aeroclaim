import { collectUploads, UploadError } from "@/lib/extract";
import { mergeParsed, parseText, type ParseResult } from "@/lib/parser";

/** Auto-fill: extract claim fields from pasted text and/or uploaded documents. */
export async function POST(request: Request) {
  const form = await request.formData();
  const text = form.get("text");
  let uploads;
  try {
    uploads = await collectUploads(form);
  } catch (e) {
    if (e instanceof UploadError) return Response.json({ error: e.message }, { status: 400 });
    throw e;
  }

  const results: (ParseResult & { filename: string })[] = [];
  if (typeof text === "string" && text.trim()) results.push({ ...parseText(text.slice(0, 50000)), filename: "Pasted text" });
  for (const it of uploads.items) if (it.parsed) results.push({ ...it.parsed, filename: it.filename });

  return Response.json({
    fields: mergeParsed(results),
    results: results.map((r) => ({ filename: r.filename, kind: r.kind, source: r.source, found: r.found, missing: r.missing })),
    unreadable: uploads.unreadable,
  });
}

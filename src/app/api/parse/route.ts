import { analyseFile, isAllowedFile, MAX_FILES } from "@/lib/extract";
import { mergeParsed, parseText, type ParseResult } from "@/lib/parser";

/** Auto-fill: extract claim fields from pasted text and/or uploaded documents. */
export async function POST(request: Request) {
  const form = await request.formData();
  const text = form.get("text");
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0).slice(0, MAX_FILES);

  const results: (ParseResult & { filename: string })[] = [];
  const unreadable: string[] = [];
  if (typeof text === "string" && text.trim()) results.push({ ...parseText(text.slice(0, 50000)), filename: "Pasted text" });
  for (const f of files) {
    if (!isAllowedFile(f)) {
      unreadable.push(`${f.name} (unsupported type or over 10 MB)`);
      continue;
    }
    const a = await analyseFile(f);
    if (a.parsed) results.push({ ...a.parsed, filename: f.name });
    else unreadable.push(`${f.name} (no text layer; enter its details manually)`);
  }

  return Response.json({
    fields: mergeParsed(results),
    results: results.map((r) => ({ filename: r.filename, kind: r.kind, source: r.source, found: r.found, missing: r.missing })),
    unreadable,
  });
}

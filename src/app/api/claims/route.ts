import { createClaim, type NewDocument } from "@/lib/db";
import { analyseFile, isAllowedFile, MAX_FILES } from "@/lib/extract";
import { assess } from "@/lib/rules";
import { todayIST } from "@/lib/time";
import { DOC_KIND_LABELS, type DocKind } from "@/lib/types";
import { validateClaimInput } from "@/lib/validate";
import { checkWeather } from "@/lib/weather";

export async function POST(request: Request) {
  const form = await request.formData();
  let raw: unknown;
  try {
    raw = JSON.parse(String(form.get("data") ?? "{}"));
  } catch {
    return Response.json({ errors: { form: "Invalid form data" } }, { status: 400 });
  }
  const v = validateClaimInput(raw);
  if (!v.ok) return Response.json({ errors: v.errors }, { status: 400 });
  const input = v.input;

  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const kinds = form.getAll("kinds").map(String);
  if (files.length > MAX_FILES) return Response.json({ errors: { files: `At most ${MAX_FILES} files` } }, { status: 400 });

  const documents: NewDocument[] = [];
  for (const [idx, f] of files.entries()) {
    if (!isAllowedFile(f)) return Response.json({ errors: { files: `${f.name}: only PDF, image or text files up to 10 MB` } }, { status: 400 });
    const a = await analyseFile(f);
    const chosen = kinds[idx];
    const kind = (chosen && chosen in DOC_KIND_LABELS ? chosen : a.kind) as DocKind;
    documents.push({ filename: f.name.slice(0, 200), mime: f.type || "application/octet-stream", kind, bytes: a.bytes, extracted: a.text?.slice(0, 20000) });
  }

  const weather = ["delay", "cancellation"].includes(input.disruptionType) ? await checkWeather(input) : null;
  const assessment = assess(input, { today: todayIST(), weather, documents });
  const id = await createClaim({ input, assessment, weather, documents });
  return Response.json({ id }, { status: 201 });
}

import { createClaim, type NewDocument } from "@/lib/db";
import { collectUploads, UploadError } from "@/lib/extract";
import { assess } from "@/lib/rules";
import { saveFile } from "@/lib/storage";
import { todayIST } from "@/lib/time";
import { DOC_KIND_LABELS, type DocKind } from "@/lib/types";
import { validateClaimInput } from "@/lib/validate";
import { checkWeather } from "@/lib/weather";

export const maxDuration = 60;

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

  let uploads;
  try {
    uploads = await collectUploads(form);
  } catch (e) {
    if (e instanceof UploadError) return Response.json({ errors: { files: e.message } }, { status: 400 });
    throw e;
  }

  const documents: NewDocument[] = [];
  for (const it of uploads.items) {
    const id = crypto.randomUUID();
    const kind = (it.chosenKind && it.chosenKind in DOC_KIND_LABELS ? it.chosenKind : it.kind) as DocKind;
    const storedKey = it.blobPathname ? `blob:${it.blobPathname}` : await saveFile(id, it.filename, it.bytes, it.mime);
    documents.push({ id, filename: it.filename, mime: it.mime, size: it.bytes.byteLength, kind, storedKey, extracted: it.text?.slice(0, 20000) });
  }

  const weather = ["delay", "cancellation"].includes(input.disruptionType) ? await checkWeather(input) : null;
  const assessment = assess(input, { today: todayIST(), weather, documents });
  const id = await createClaim({ input, assessment, weather, documents });
  return Response.json({ id }, { status: 201 });
}

import { createClaim, type NewDocument } from "@/lib/db";
import { collectUploads, UploadError } from "@/lib/extract";
import { parseText } from "@/lib/parser";
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

  const pastedText = String(form.get("text") ?? "").trim();
  if (pastedText) {
    const parsed = parseText(pastedText, "pasted-evidence.txt");
    const hasETicket = documents.some((d) => d.kind === "e_ticket");
    const hasNotice = documents.some((d) => d.kind === "airline_notice");
    const hasPir = documents.some((d) => d.kind === "pir");

    if (!hasETicket && (parsed.fields.pnr || parsed.fields.flightNumber || parsed.fields.totalFare || parsed.kind === "e_ticket")) {
      const id = crypto.randomUUID();
      const bytes = new TextEncoder().encode(pastedText);
      const filename = "e-ticket-text.txt";
      const storedKey = await saveFile(id, filename, bytes, "text/plain");
      documents.push({ id, filename, mime: "text/plain", size: bytes.byteLength, kind: "e_ticket", storedKey, extracted: pastedText.slice(0, 20000) });
    }

    if (!hasNotice && (parsed.kind === "airline_notice" || /cancell|delay|reschedul/i.test(pastedText))) {
      const id = crypto.randomUUID();
      const bytes = new TextEncoder().encode(pastedText);
      const filename = "airline-notice-text.txt";
      const storedKey = await saveFile(id, filename, bytes, "text/plain");
      documents.push({ id, filename, mime: "text/plain", size: bytes.byteLength, kind: "airline_notice", storedKey, extracted: pastedText.slice(0, 20000) });
    }

    if (!hasPir && (parsed.kind === "pir" || parsed.fields.pirNumber)) {
      const id = crypto.randomUUID();
      const bytes = new TextEncoder().encode(pastedText);
      const filename = "pir-report-text.txt";
      const storedKey = await saveFile(id, filename, bytes, "text/plain");
      documents.push({ id, filename, mime: "text/plain", size: bytes.byteLength, kind: "pir", storedKey, extracted: pastedText.slice(0, 20000) });
    }
  }

  const weather = ["delay", "cancellation"].includes(input.disruptionType) ? await checkWeather(input) : null;
  const assessment = assess(input, { today: todayIST(), weather, documents });
  const id = await createClaim({ input, assessment, weather, documents });
  return Response.json({ id }, { status: 201 });
}

import { addDocuments, getClaim, updateAssessment } from "@/lib/db";
import { collectUploads, UploadError } from "@/lib/extract";
import { assess } from "@/lib/rules";
import { saveFile } from "@/lib/storage";
import { todayIST } from "@/lib/time";
import { DOC_KIND_LABELS, type DocKind } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const claim = await getClaim(id);
  if (!claim) return Response.json({ error: "Claim not found" }, { status: 404 });

  const form = await request.formData();
  let uploads;
  try {
    uploads = await collectUploads(form);
  } catch (e) {
    if (e instanceof UploadError) return Response.json({ error: e.message }, { status: 400 });
    throw e;
  }

  const newDocs = [];
  for (const it of uploads.items) {
    const docId = crypto.randomUUID();
    const kind = (it.chosenKind && it.chosenKind in DOC_KIND_LABELS ? it.chosenKind : it.kind) as DocKind;
    const storedKey = it.blobPathname ? `blob:${it.blobPathname}` : await saveFile(docId, it.filename, it.bytes, it.mime);
    newDocs.push({
      id: docId,
      filename: it.filename,
      mime: it.mime,
      size: it.bytes.byteLength,
      kind,
      storedKey,
      extracted: it.text?.slice(0, 20000),
    });
  }

  if (newDocs.length > 0) {
    await addDocuments(id, newDocs);
  }

  const allDocs = [...claim.documents, ...newDocs];
  const assessment = assess(claim.input, { today: todayIST(), weather: claim.weather, documents: allDocs });
  await updateAssessment(id, assessment, claim.weather);

  return Response.json({ ok: true, count: newDocs.length });
}

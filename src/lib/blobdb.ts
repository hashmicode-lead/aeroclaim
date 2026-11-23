import "server-only";
import { get, list, put } from "@vercel/blob";
import { blobEnabled, loadFile } from "./storage";
import type { Assessment, ClaimInput, ClaimRecord, StoredDocument, WeatherReport } from "./types";

/**
 * Claim storage on a private Vercel Blob store: one JSON object per claim plus a small index
 * object per document. Used on Vercel when no Turso database is configured, so claims persist
 * across serverless instances without any extra account.
 */
export function blobDbActive(): boolean {
  return !process.env.TURSO_DATABASE_URL && blobEnabled() && (Boolean(process.env.VERCEL) || process.env.AEROCLAIM_BLOB_DB === "1");
}

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

type StoredDoc = StoredDocument & { storedKey: string };
interface StoredClaim {
  id: string;
  createdAt: string;
  input: ClaimInput;
  assessment: Assessment;
  weather: WeatherReport | null;
  documents: StoredDoc[];
}

async function readJson<T>(pathname: string): Promise<T | null> {
  const res = await get(pathname, { access: "private", useCache: false }).catch(() => null);
  if (!res || res.statusCode !== 200 || !res.stream) return null;
  const text = await new Response(res.stream).text();
  return JSON.parse(text) as T;
}

async function writeJson(pathname: string, data: unknown) {
  await put(pathname, JSON.stringify(data), { access: "private", contentType: "application/json", addRandomSuffix: false, allowOverwrite: true });
}

const toRecord = (c: StoredClaim): ClaimRecord => ({
  id: c.id,
  createdAt: c.createdAt,
  input: c.input,
  assessment: c.assessment,
  weather: c.weather,
  documents: c.documents.map((d) => { const { storedKey, ...rest } = d; void storedKey; return rest; }),
});

export async function createClaimBlob(args: {
  input: ClaimInput;
  assessment: Assessment;
  weather: WeatherReport | null;
  documents: { id: string; filename: string; mime: string; size: number; kind: StoredDocument["kind"]; storedKey: string; extracted?: string }[];
}): Promise<string> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const docs: StoredDoc[] = args.documents.map((d) => ({ id: d.id, claimId: id, filename: d.filename, mime: d.mime, size: d.size, kind: d.kind, extracted: d.extracted, createdAt: now, storedKey: d.storedKey }));
  await Promise.all(docs.map((d) => writeJson(`db/docs/${d.id}.json`, d)));
  await writeJson(`db/claims/${id}.json`, { id, createdAt: now, input: args.input, assessment: args.assessment, weather: args.weather, documents: docs } satisfies StoredClaim);
  return id;
}

export async function addDocumentsBlob(
  claimId: string,
  documents: { id: string; filename: string; mime: string; size: number; kind: StoredDocument["kind"]; storedKey: string; extracted?: string }[]
): Promise<void> {
  if (!ID.test(claimId)) return;
  const c = await readJson<StoredClaim>(`db/claims/${claimId}.json`);
  if (!c) return;
  const now = new Date().toISOString();
  const docs: StoredDoc[] = documents.map((d) => ({
    id: d.id,
    claimId,
    filename: d.filename,
    mime: d.mime,
    size: d.size,
    kind: d.kind,
    extracted: d.extracted,
    createdAt: now,
    storedKey: d.storedKey,
  }));
  await Promise.all(docs.map((d) => writeJson(`db/docs/${d.id}.json`, d)));
  await writeJson(`db/claims/${claimId}.json`, { ...c, documents: [...c.documents, ...docs] });
}

export async function getClaimBlob(id: string): Promise<ClaimRecord | null> {
  if (!ID.test(id)) return null;
  const c = await readJson<StoredClaim>(`db/claims/${id}.json`);
  return c ? toRecord(c) : null;
}

export async function listClaimsBlob(): Promise<ClaimRecord[]> {
  const { blobs } = await list({ prefix: "db/claims/", limit: 100 });
  const newest = blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt)).slice(0, 50);
  const claims = await Promise.all(newest.map((b) => readJson<StoredClaim>(b.pathname)));
  return claims.filter((c): c is StoredClaim => c !== null).map(toRecord).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function updateAssessmentBlob(id: string, assessment: Assessment, weather: WeatherReport | null) {
  if (!ID.test(id)) return;
  const c = await readJson<StoredClaim>(`db/claims/${id}.json`);
  if (c) await writeJson(`db/claims/${id}.json`, { ...c, assessment, weather });
}

export async function readDocumentBlob(id: string): Promise<{ doc: StoredDocument; body: Uint8Array | ReadableStream<Uint8Array> } | null> {
  if (!ID.test(id)) return null;
  const d = await readJson<StoredDoc>(`db/docs/${id}.json`);
  if (!d) return null;
  const body = await loadFile(d.storedKey);
  if (!body) return null;
  const { storedKey, ...doc } = d;
  void storedKey;
  return { doc, body };
}

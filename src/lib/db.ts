import "server-only";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { createClient, type Client, type InStatement } from "@libsql/client";
import { createClaimBlob, getClaimBlob, listClaimsBlob, readDocumentBlob, updateAssessmentBlob, blobDbActive } from "./blobdb";
import { DATA_DIR, loadFile } from "./storage";
import type { Assessment, ClaimInput, ClaimRecord, DocKind, StoredDocument, WeatherReport } from "./types";

/**
 * Database: libSQL / Turso.
 * - Production (Vercel): TURSO_DATABASE_URL + TURSO_AUTH_TOKEN (set by the Turso integration).
 * - Development: a local SQLite file at ./data/aeroclaim.db.
 * - Vercel without Turso: a private Vercel Blob store (see blobdb.ts).
 */
const g = globalThis as unknown as { __aeroclaimDb?: { client: Client; ready: Promise<unknown> } };

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS claims (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    input TEXT NOT NULL,
    assessment TEXT NOT NULL,
    weather TEXT
  );
  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    claim_id TEXT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    mime TEXT NOT NULL,
    size INTEGER NOT NULL,
    kind TEXT NOT NULL,
    stored_name TEXT NOT NULL,
    extracted TEXT,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS documents_claim ON documents(claim_id);
`;

async function db(): Promise<Client> {
  if (!g.__aeroclaimDb) {
    let url = process.env.TURSO_DATABASE_URL;
    if (!url) {
      if (process.env.VERCEL) console.warn("TURSO_DATABASE_URL is not set: using a temporary database in /tmp. Claims will not persist between deployments.");
      mkdirSync(DATA_DIR, { recursive: true });
      url = "file:" + path.join(DATA_DIR, "aeroclaim.db").replace(/\\/g, "/");
    }
    const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
    g.__aeroclaimDb = { client, ready: client.executeMultiple(SCHEMA) };
  }
  try {
    await g.__aeroclaimDb.ready;
  } catch (e) {
    g.__aeroclaimDb = undefined; // retry schema setup on the next request
    throw e;
  }
  return g.__aeroclaimDb.client;
}

type Row = Record<string, unknown>;

const toDoc = (r: Row): StoredDocument => ({
  id: String(r.id),
  claimId: String(r.claim_id),
  filename: String(r.filename),
  mime: String(r.mime),
  size: Number(r.size),
  kind: String(r.kind) as DocKind,
  extracted: r.extracted ? String(r.extracted) : undefined,
  createdAt: String(r.created_at),
});

const toClaim = (row: Row, documents: StoredDocument[]): ClaimRecord => ({
  id: String(row.id),
  createdAt: String(row.created_at),
  input: JSON.parse(String(row.input)),
  assessment: JSON.parse(String(row.assessment)),
  weather: row.weather ? JSON.parse(String(row.weather)) : null,
  documents,
});

export interface NewDocument {
  id: string;
  filename: string;
  mime: string;
  size: number;
  kind: DocKind;
  storedKey: string;
  extracted?: string;
}

export async function createClaim(args: {
  input: ClaimInput;
  assessment: Assessment;
  weather: WeatherReport | null;
  documents: NewDocument[];
}): Promise<string> {
  if (blobDbActive()) return createClaimBlob(args);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const stmts: InStatement[] = [
    {
      sql: "INSERT INTO claims (id, created_at, input, assessment, weather) VALUES (?, ?, ?, ?, ?)",
      args: [id, now, JSON.stringify(args.input), JSON.stringify(args.assessment), args.weather ? JSON.stringify(args.weather) : null],
    },
    ...args.documents.map((d) => ({
      sql: "INSERT INTO documents (id, claim_id, filename, mime, size, kind, stored_name, extracted, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: [d.id, id, d.filename, d.mime, d.size, d.kind, d.storedKey, d.extracted ?? null, now],
    })),
  ];
  await (await db()).batch(stmts, "write");
  return id;
}

export async function getClaim(id: string): Promise<ClaimRecord | null> {
  if (blobDbActive()) return getClaimBlob(id);
  const c = await db();
  const [claims, docs] = await c.batch(
    [
      { sql: "SELECT * FROM claims WHERE id = ?", args: [id] },
      { sql: "SELECT * FROM documents WHERE claim_id = ? ORDER BY created_at", args: [id] },
    ],
    "read",
  );
  const row = claims.rows[0];
  return row ? toClaim(row, docs.rows.map(toDoc)) : null;
}

export async function listClaims(): Promise<ClaimRecord[]> {
  if (blobDbActive()) return listClaimsBlob();
  const res = await (await db()).execute("SELECT id, created_at, input, assessment, NULL AS weather FROM claims ORDER BY created_at DESC LIMIT 200");
  return res.rows.map((r) => toClaim(r, []));
}

export async function updateAssessment(id: string, assessment: Assessment, weather: WeatherReport | null) {
  if (blobDbActive()) return updateAssessmentBlob(id, assessment, weather);
  await (await db()).execute({
    sql: "UPDATE claims SET assessment = ?, weather = ? WHERE id = ?",
    args: [JSON.stringify(assessment), weather ? JSON.stringify(weather) : null, id],
  });
}

export async function readDocument(id: string): Promise<{ doc: StoredDocument; body: Uint8Array | ReadableStream<Uint8Array> } | null> {
  if (blobDbActive()) return readDocumentBlob(id);
  const res = await (await db()).execute({ sql: "SELECT * FROM documents WHERE id = ?", args: [id] });
  const row = res.rows[0];
  if (!row) return null;
  const body = await loadFile(String(row.stored_name));
  return body ? { doc: toDoc(row), body } : null;
}

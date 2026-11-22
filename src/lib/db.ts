import "server-only";
import { mkdirSync } from "node:fs";
import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { Assessment, ClaimInput, ClaimRecord, DocKind, StoredDocument, WeatherReport } from "./types";

const DATA_DIR = process.env.AEROCLAIM_DATA_DIR ?? path.join(process.cwd(), "data");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

const g = globalThis as unknown as { __aeroclaimDb?: DatabaseSync };

function db(): DatabaseSync {
  if (g.__aeroclaimDb) return g.__aeroclaimDb;
  mkdirSync(UPLOAD_DIR, { recursive: true });
  const conn = new DatabaseSync(path.join(DATA_DIR, "aeroclaim.db"));
  conn.exec(`
    PRAGMA journal_mode = WAL;
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
  `);
  g.__aeroclaimDb = conn;
  return conn;
}

type DocRow = { id: string; claim_id: string; filename: string; mime: string; size: number; kind: string; stored_name: string; extracted: string | null; created_at: string };
type ClaimRow = { id: string; created_at: string; input: string; assessment: string; weather: string | null };

const toDoc = (r: DocRow): StoredDocument => ({
  id: r.id,
  claimId: r.claim_id,
  filename: r.filename,
  mime: r.mime,
  size: r.size,
  kind: r.kind as DocKind,
  extracted: r.extracted ?? undefined,
  createdAt: r.created_at,
});

export interface NewDocument {
  filename: string;
  mime: string;
  kind: DocKind;
  bytes: Uint8Array;
  extracted?: string;
}

export async function createClaim(args: {
  input: ClaimInput;
  assessment: Assessment;
  weather: WeatherReport | null;
  documents: NewDocument[];
}): Promise<string> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const conn = db();
  const stored: { doc: NewDocument; id: string; storedName: string }[] = [];
  for (const doc of args.documents) {
    const docId = crypto.randomUUID();
    const ext = path.extname(doc.filename).replace(/[^.\w]/g, "").slice(0, 10);
    const storedName = `${docId}${ext}`;
    await writeFile(path.join(UPLOAD_DIR, storedName), doc.bytes);
    stored.push({ doc, id: docId, storedName });
  }
  conn.exec("BEGIN");
  try {
    conn.prepare("INSERT INTO claims (id, created_at, input, assessment, weather) VALUES (?, ?, ?, ?, ?)").run(
      id,
      now,
      JSON.stringify(args.input),
      JSON.stringify(args.assessment),
      args.weather ? JSON.stringify(args.weather) : null,
    );
    const ins = conn.prepare(
      "INSERT INTO documents (id, claim_id, filename, mime, size, kind, stored_name, extracted, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    );
    for (const s of stored) {
      ins.run(s.id, id, s.doc.filename, s.doc.mime, s.doc.bytes.byteLength, s.doc.kind, s.storedName, s.doc.extracted ?? null, now);
    }
    conn.exec("COMMIT");
  } catch (e) {
    conn.exec("ROLLBACK");
    throw e;
  }
  return id;
}

export function getClaim(id: string): ClaimRecord | null {
  const conn = db();
  const row = conn.prepare("SELECT * FROM claims WHERE id = ?").get(id) as ClaimRow | undefined;
  if (!row) return null;
  const docs = conn.prepare("SELECT * FROM documents WHERE claim_id = ? ORDER BY created_at").all(id) as DocRow[];
  return {
    id: row.id,
    createdAt: row.created_at,
    input: JSON.parse(row.input),
    assessment: JSON.parse(row.assessment),
    weather: row.weather ? JSON.parse(row.weather) : null,
    documents: docs.map(toDoc),
  };
}

export function listClaims(): ClaimRecord[] {
  const conn = db();
  const rows = conn.prepare("SELECT * FROM claims ORDER BY created_at DESC LIMIT 200").all() as ClaimRow[];
  return rows.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    input: JSON.parse(row.input),
    assessment: JSON.parse(row.assessment),
    weather: row.weather ? JSON.parse(row.weather) : null,
    documents: [],
  }));
}

export function updateAssessment(id: string, assessment: Assessment, weather: WeatherReport | null) {
  db().prepare("UPDATE claims SET assessment = ?, weather = ? WHERE id = ?").run(JSON.stringify(assessment), weather ? JSON.stringify(weather) : null, id);
}

export async function readDocument(id: string): Promise<{ doc: StoredDocument; bytes: Buffer } | null> {
  const row = db().prepare("SELECT * FROM documents WHERE id = ?").get(id) as DocRow | undefined;
  if (!row) return null;
  const bytes = await readFile(path.join(UPLOAD_DIR, path.basename(row.stored_name)));
  return { doc: toDoc(row), bytes };
}

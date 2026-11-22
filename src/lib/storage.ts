import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, put } from "@vercel/blob";

/**
 * File storage for evidence uploads.
 * - Vercel Blob (private store) when BLOB_READ_WRITE_TOKEN / BLOB_STORE_ID is set: required on Vercel.
 * - Local disk under ./data/uploads otherwise (development).
 * Stored keys are prefixed `blob:` or `file:` so both can coexist.
 */
export const DATA_DIR = process.env.AEROCLAIM_DATA_DIR ?? path.join(process.cwd(), "data");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
export const BLOB_PREFIX = "uploads/";
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

export function blobEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

/** A file the browser uploaded straight to Blob. Only the reference reaches our functions. */
export interface BlobRef {
  pathname: string;
  filename: string;
  mime: string;
  kind?: string;
}

export function isValidBlobPathname(p: unknown): p is string {
  return typeof p === "string" && p.startsWith(BLOB_PREFIX) && !p.includes("..") && p.length < 300;
}

export async function saveFile(id: string, filename: string, bytes: Uint8Array, mime: string): Promise<string> {
  const ext = path.extname(filename).replace(/[^.\w]/g, "").slice(0, 10);
  if (blobEnabled()) {
    const res = await put(`${BLOB_PREFIX}${id}${ext}`, Buffer.from(bytes), { access: "private", contentType: mime, addRandomSuffix: true });
    return `blob:${res.pathname}`;
  }
  await mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${id}${ext}`;
  await writeFile(path.join(UPLOAD_DIR, name), bytes);
  return `file:${name}`;
}

async function streamToBytes(stream: ReadableStream<Uint8Array>, limit: number): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  let total = 0;
  const reader = stream.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) {
      await reader.cancel();
      throw new Error("File too large");
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.byteLength;
  }
  return out;
}

/** Read a blob uploaded by the client (for parsing), enforcing the size limit. */
export async function readBlob(pathname: string): Promise<{ bytes: Uint8Array; contentType: string } | null> {
  const res = await get(pathname, { access: "private", useCache: false });
  if (!res || res.statusCode !== 200) return null;
  if (res.blob.size > MAX_FILE_BYTES) throw new Error("File too large");
  return { bytes: await streamToBytes(res.stream, MAX_FILE_BYTES), contentType: res.blob.contentType };
}

export async function loadFile(key: string): Promise<Uint8Array | ReadableStream<Uint8Array> | null> {
  if (key.startsWith("blob:")) {
    const res = await get(key.slice(5), { access: "private" });
    return res && res.statusCode === 200 ? res.stream : null;
  }
  const name = path.basename(key.replace(/^file:/, ""));
  return new Uint8Array(await readFile(path.join(UPLOAD_DIR, name)));
}

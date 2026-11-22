import "server-only";
import { classifyDocument, parseText, type ParseResult } from "./parser";
import { isValidBlobPathname, MAX_FILE_BYTES, readBlob, type BlobRef } from "./storage";
import type { DocKind } from "./types";

export { MAX_FILE_BYTES };
export const MAX_FILES = 12;
export const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp", "image/heic", "text/plain"];

export function isAllowedFile(name: string, mime: string, size: number): boolean {
  return size <= MAX_FILE_BYTES && (ALLOWED_TYPES.includes(mime) || /\.(pdf|png|jpe?g|webp|heic|txt)$/i.test(name));
}

/** Pull text from a file. Handles text-layer PDFs and .txt; images need manual entry for now. */
export async function extractText(bytes: Uint8Array, mime: string, filename: string): Promise<string | undefined> {
  try {
    if (mime === "application/pdf" || /\.pdf$/i.test(filename)) {
      const { extractText: pdfText, getDocumentProxy } = await import("unpdf");
      const pdf = await getDocumentProxy(new Uint8Array(bytes));
      const { text } = await pdfText(pdf, { mergePages: true });
      return text.slice(0, 50000);
    }
    if (mime.startsWith("text/") || /\.txt$/i.test(filename)) {
      return new TextDecoder().decode(bytes).slice(0, 50000);
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export interface Analysed {
  filename: string;
  mime: string;
  bytes: Uint8Array;
  text?: string;
  kind: DocKind;
  parsed?: ParseResult;
  /** Set when the file already lives in Blob storage. */
  blobPathname?: string;
}

async function analyse(filename: string, mime: string, bytes: Uint8Array): Promise<Omit<Analysed, "blobPathname">> {
  const text = await extractText(bytes, mime, filename);
  if (text?.trim()) {
    const parsed = parseText(text, filename);
    return { filename, mime, bytes, text, kind: parsed.kind, parsed };
  }
  return { filename, mime, bytes, kind: classifyDocument("", filename) };
}

export class UploadError extends Error {}

/**
 * Collect files from a request: multipart `files` (local / small uploads) and/or
 * `blobs` (JSON BlobRef[] of files the browser uploaded directly to Vercel Blob).
 */
export async function collectUploads(form: FormData): Promise<{ items: (Analysed & { chosenKind?: string })[]; unreadable: string[] }> {
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const kinds = form.getAll("kinds").map(String);
  let refs: BlobRef[] = [];
  try {
    const raw = JSON.parse(String(form.get("blobs") ?? "[]"));
    refs = Array.isArray(raw) ? raw : [];
  } catch {
    throw new UploadError("Invalid upload references");
  }
  if (files.length + refs.length > MAX_FILES) throw new UploadError(`At most ${MAX_FILES} files`);

  const items: (Analysed & { chosenKind?: string })[] = [];
  const unreadable: string[] = [];
  for (const [i, f] of files.entries()) {
    if (!isAllowedFile(f.name, f.type, f.size)) throw new UploadError(`${f.name}: only PDF, image or text files up to 10 MB`);
    items.push({ ...(await analyse(f.name.slice(0, 200), f.type || "application/octet-stream", new Uint8Array(await f.arrayBuffer()))), chosenKind: kinds[i] });
  }
  for (const r of refs) {
    if (!isValidBlobPathname(r?.pathname) || typeof r.filename !== "string") throw new UploadError("Invalid upload reference");
    const blob = await readBlob(r.pathname).catch(() => null);
    if (!blob) {
      unreadable.push(`${r.filename} (upload not found)`);
      continue;
    }
    if (!isAllowedFile(r.filename, blob.contentType, blob.bytes.byteLength)) throw new UploadError(`${r.filename}: only PDF, image or text files up to 10 MB`);
    items.push({ ...(await analyse(r.filename.slice(0, 200), blob.contentType, blob.bytes)), blobPathname: r.pathname, chosenKind: r.kind });
  }
  for (const it of items) if (!it.parsed) unreadable.push(`${it.filename} (no text layer; enter its details manually)`);
  return { items, unreadable };
}

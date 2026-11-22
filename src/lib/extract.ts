import "server-only";
import { classifyDocument, parseText, type ParseResult } from "./parser";
import type { DocKind } from "./types";

export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_FILES = 12;
const ALLOWED = /^(application\/pdf|image\/(png|jpe?g|webp|heic)|text\/plain)$/;

export function isAllowedFile(f: File): boolean {
  return f.size <= MAX_FILE_BYTES && (ALLOWED.test(f.type) || /\.(pdf|png|jpe?g|webp|heic|txt)$/i.test(f.name));
}

/** Pull text from an uploaded file. PDFs with a text layer and .txt files only; images need manual entry for now. */
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

export async function analyseFile(file: File): Promise<{ bytes: Uint8Array; text?: string; kind: DocKind; parsed?: ParseResult }> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const text = await extractText(bytes, file.type, file.name);
  if (text && text.trim()) {
    const parsed = parseText(text, file.name);
    return { bytes, text, kind: parsed.kind, parsed };
  }
  return { bytes, kind: classifyDocument("", file.name) };
}

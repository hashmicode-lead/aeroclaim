import { readDocument } from "@/lib/db";

const INLINE = /^(application\/pdf|image\/(png|jpeg|webp)|text\/plain)$/;

/** Streams an evidence file. Blob files are private, so they are always proxied through here. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = await readDocument(id).catch(() => null);
  if (!found) return new Response("Not found", { status: 404 });
  const { doc, body } = found;
  const inline = INLINE.test(doc.mime);
  return new Response(body instanceof Uint8Array ? new Uint8Array(body) : body, {
    headers: {
      "Content-Type": inline ? doc.mime : "application/octet-stream",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${encodeURIComponent(doc.filename)}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
    },
  });
}

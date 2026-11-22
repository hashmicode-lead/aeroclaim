import { readDocument } from "@/lib/db";

const INLINE = /^(application\/pdf|image\/(png|jpeg|webp)|text\/plain)$/;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = await readDocument(id).catch(() => null);
  if (!found) return new Response("Not found", { status: 404 });
  const { doc, bytes } = found;
  const inline = INLINE.test(doc.mime);
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": inline ? doc.mime : "application/octet-stream",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${encodeURIComponent(doc.filename)}"`,
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
    },
  });
}

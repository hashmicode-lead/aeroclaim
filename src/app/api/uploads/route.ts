import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { ALLOWED_TYPES, MAX_FILE_BYTES } from "@/lib/extract";
import { BLOB_PREFIX, blobEnabled } from "@/lib/storage";

/** Issues short-lived tokens so the browser can upload evidence straight to private Vercel Blob storage. */
export async function POST(request: Request) {
  if (!blobEnabled()) return Response.json({ error: "Blob storage is not configured" }, { status: 501 });
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith(BLOB_PREFIX) || pathname.includes("..")) throw new Error("Invalid path");
        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_FILE_BYTES,
          addRandomSuffix: true,
          validUntil: Date.now() + 10 * 60 * 1000,
        };
      },
    });
    return Response.json(result);
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 400 });
  }
}

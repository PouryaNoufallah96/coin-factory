import { NextResponse } from "next/server";

import { getAdminInquiryFile } from "@/features/inquiries/db/queries";
import { inquiryEntityIdInputSchema } from "@/features/inquiries/schemas/admin-inquiry";
import { getCurrentAdminSession } from "@/server/auth/session";
import { getStorage } from "@/services/storage";

export async function GET(
  _request: Request,
  context: RouteContext<"/admin/files/[id]">
) {
  const adminSession = await getCurrentAdminSession();

  if (!adminSession) {
    return new NextResponse("Admin sign-in required.", { status: 401 });
  }

  const { id } = await context.params;
  const parsed = inquiryEntityIdInputSchema.safeParse({ id });

  if (!parsed.success) {
    return new NextResponse("File was not found.", { status: 404 });
  }

  const file = await getAdminInquiryFile(parsed.data.id);

  if (!file) {
    return new NextResponse("File was not found.", { status: 404 });
  }

  try {
    const object = await getStorage().openRead(file.storageKey);
    const headers = new Headers({
      "Cache-Control": "private, no-store",
      "Content-Disposition": contentDisposition(file.filename),
      "Content-Type": file.contentType,
      "X-Content-Type-Options": "nosniff",
    });
    headers.set(
      "Content-Length",
      String(object.contentLength ?? file.sizeBytes)
    );

    return new Response(object.stream, { headers });
  } catch {
    console.error(`inquiry file ${file.id}: storage object could not be read`);
    return new NextResponse("File was not found.", { status: 404 });
  }
}

function contentDisposition(filename: string) {
  const fallback = sanitizeDownloadFilename(filename);
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encodeRfc5987(filename)}`;
}

function sanitizeDownloadFilename(filename: string) {
  const cleaned = filename
    .normalize("NFKD")
    .replaceAll(/[\r\n"]/g, "")
    .replaceAll(/[\\/<>|:*?]/g, "_")
    .replaceAll(/[^\x20-\x7E]/g, "_")
    .trim();

  return cleaned || "document";
}

function encodeRfc5987(value: string) {
  return encodeURIComponent(value)
    .replaceAll("'", "%27")
    .replaceAll("(", "%28")
    .replaceAll(")", "%29")
    .replaceAll("*", "%2A");
}

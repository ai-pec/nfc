import "server-only";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getCurrentAppUser } from "@/lib/auth-server";
import { supabaseAdmin, supabaseUrl } from "@/lib/supabase";

export const STORAGE_BUCKETS = {
  media: "portfolio-media",
  documents: "portfolio-documents",
} as const;

function sanitizeFilename(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  const base = path.basename(filename, ext).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  return `${base || "asset"}${ext}`;
}

function ensureBucketName(assetType: "media" | "document") {
  return assetType === "media" ? STORAGE_BUCKETS.media : STORAGE_BUCKETS.documents;
}

export async function uploadPortfolioAsset({
  file,
  assetType,
}: {
  file: File;
  assetType: "media" | "document";
}) {
  const appUser = await getCurrentAppUser();

  if (!appUser?.uid) {
    throw new Error("App user not found");
  }

  const bucket = ensureBucketName(assetType);
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const cleanedName = sanitizeFilename(file.name);
  const objectPath =
    assetType === "media"
      ? `${appUser.uid}/gallery/${randomUUID()}-${cleanedName}`
      : `${appUser.uid}/documents/${randomUUID()}-${cleanedName}`;

  const uploadResult = await supabaseAdmin.storage.from(bucket).upload(objectPath, fileBuffer, {
    contentType: file.type || undefined,
    upsert: false,
  });

  if (uploadResult.error) {
    throw uploadResult.error;
  }

  if (assetType === "media") {
    return {
      bucket,
      path: objectPath,
      name: file.name,
      contentType: file.type || null,
      publicUrl: `${supabaseUrl}/storage/v1/object/public/${bucket}/${objectPath}`,
    };
  }

  const signedUrlResult = await supabaseAdmin.storage.from(bucket).createSignedUrl(objectPath, 60 * 60);

  if (signedUrlResult.error) {
    throw signedUrlResult.error;
  }

  return {
    bucket,
    path: objectPath,
    name: file.name,
    contentType: file.type || null,
    signedUrl: signedUrlResult.data.signedUrl,
  };
}

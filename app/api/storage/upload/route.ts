import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { uploadPortfolioAsset } from "@/lib/storage";

export async function POST(request: Request) {
  await requireAuth();

  const formData = await request.formData();
  const assetType = formData.get("assetType");
  const fileEntries = formData.getAll("files").filter((item): item is File => item instanceof File);

  if (assetType !== "media" && assetType !== "document") {
    return NextResponse.json({ error: "Invalid asset type" }, { status: 400 });
  }

  if (fileEntries.length === 0) {
    return NextResponse.json({ error: "No files received" }, { status: 400 });
  }

  try {
    const uploads = await Promise.all(
      fileEntries.map((file) =>
        uploadPortfolioAsset({
          file,
          assetType,
        }),
      ),
    );

    return NextResponse.json({ uploads });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 },
    );
  }
}

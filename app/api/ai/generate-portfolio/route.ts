import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, getCurrentAppUser } from "@/lib/auth-server";
import { runPortfolioBuild } from "@/lib/portfolio-builds";
import { supabaseAdmin } from "@/lib/supabase";

const requestSchema = z.object({
  stylePrompt: z.string().min(12).max(500),
});

export async function POST(request: Request) {
  await requireAuth();

  const body = await request.json();
  const parsedBody = requestSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
  }

  const appUser = await getCurrentAppUser();

  if (!appUser?.uid) {
    return NextResponse.json({ error: "App user not found" }, { status: 404 });
  }

  const { data: portfolio, error: portfolioError } = await supabaseAdmin
    .from("portfolios")
    .select(
      "uid, slug, name, email, phone, whatsapp, instagram, linkedin, company, designation, headline, about, services, gallery, experience, education, website, theme, address, meeting_link",
    )
    .eq("uid", appUser.uid)
    .single();

  if (portfolioError || !portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  try {
    const result = await runPortfolioBuild({
      portfolio,
      requestedByUid: appUser.uid,
      stylePrompt: parsedBody.data.stylePrompt,
      intakePayload: {
        source: "dashboard",
        requestedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      blueprint: result.blueprint,
      build: result.build,
      publicUrl: result.publicUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Portfolio build failed" },
      { status: 500 },
    );
  }
}

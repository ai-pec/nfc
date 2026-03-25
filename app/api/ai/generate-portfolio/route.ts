import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, getCurrentAppUser } from "@/lib/auth-server";
import { generatePortfolioBlueprint } from "@/lib/portfolio-ai";
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
      "uid, slug, name, email, phone, whatsapp, instagram, linkedin, company, designation, headline, about, services, experience, education, website, theme",
    )
    .eq("uid", appUser.uid)
    .single();

  if (portfolioError || !portfolio) {
    return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
  }

  const blueprint = await generatePortfolioBlueprint(portfolio, parsedBody.data.stylePrompt);

  return NextResponse.json({ blueprint });
}

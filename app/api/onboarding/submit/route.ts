import { NextResponse } from "next/server";
import { requireAuth, getCurrentAppUser } from "@/lib/auth-server";
import { normalizeOnboardingInput, onboardingInputSchema } from "@/lib/onboarding";
import { runPortfolioBuild } from "@/lib/portfolio-builds";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  const session = await requireAuth();
  const appUser = await getCurrentAppUser();

  if (!appUser?.uid) {
    return NextResponse.json({ error: "App user not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = onboardingInputSchema.safeParse(body);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path?.length ? String(issue.path[0]) : "form";
    const message = issue?.message ?? "Invalid onboarding data";

    return NextResponse.json({ error: `${field}: ${message}` }, { status: 400 });
  }

  const data = normalizeOnboardingInput(parsed.data);

  const userUpdate = await supabaseAdmin
    .from("users")
    .update({
      name: data.name,
      phone: data.phone,
      whatsapp: data.whatsapp,
      instagram: data.instagram,
      linkedin: data.linkedin,
      profile_completed: true,
    })
    .eq("uid", appUser.uid);

  if (userUpdate.error) {
    return NextResponse.json({ error: userUpdate.error.message }, { status: 500 });
  }

  const portfolioUpdate = await supabaseAdmin
    .from("portfolios")
    .update({
      name: data.name,
      email: session.user.email,
      phone: data.phone,
      whatsapp: data.whatsapp,
      instagram: data.instagram,
      linkedin: data.linkedin,
      company: data.company,
      designation: data.designation,
      headline: data.headline,
      about: data.about,
      services: data.services,
      gallery: data.gallery,
      experience: data.experience,
      education: data.education,
      website: data.website,
      address: data.address,
      meeting_link: data.meetingLink,
      photo_url: data.gallery[0] ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("uid", appUser.uid);

  if (portfolioUpdate.error) {
    return NextResponse.json({ error: portfolioUpdate.error.message }, { status: 500 });
  }

  const { data: portfolio, error: portfolioError } = await supabaseAdmin
    .from("portfolios")
    .select(
      "uid, slug, name, email, phone, whatsapp, instagram, linkedin, company, designation, headline, about, services, gallery, experience, education, website, theme, address, meeting_link",
    )
    .eq("uid", appUser.uid)
    .single();

  if (portfolioError || !portfolio) {
    return NextResponse.json({ error: "Portfolio not found after save" }, { status: 404 });
  }

  try {
    const result = await runPortfolioBuild({
      portfolio,
      requestedByUid: appUser.uid,
      stylePrompt: data.stylePrompt,
      intakePayload: {
        source: "onboarding",
        targetAudience: data.targetAudience,
        goals: data.goals,
        documentLinks: data.documentLinks,
        uploadedDocuments: data.uploadedDocuments,
        submittedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      build: result.build,
      blueprint: result.blueprint,
      publicUrl: result.publicUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Portfolio build failed" },
      { status: 500 },
    );
  }
}

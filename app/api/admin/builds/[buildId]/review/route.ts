import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase";

type RouteContext = {
  params: Promise<{
    buildId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  await requireAdmin();
  const { buildId } = await context.params;
  const body = await request.json();
  const action = typeof body.action === "string" ? body.action : "";

  if (!["approved", "rejected", "needs_revision"].includes(action)) {
    return NextResponse.json({ error: "Invalid review action" }, { status: 400 });
  }

  const { data: build, error: buildError } = await supabaseAdmin
    .from("portfolio_builds")
    .select("id, validation_result")
    .eq("id", buildId)
    .maybeSingle();

  if (buildError || !build) {
    return NextResponse.json({ error: "Build not found" }, { status: 404 });
  }

  const findings =
    build.validation_result && typeof build.validation_result === "object" && "issues" in build.validation_result
      ? ((build.validation_result as { issues?: unknown }).issues ?? [])
      : [];

  const reviewInsert = await supabaseAdmin.from("portfolio_reviews").insert({
    build_id: buildId,
    reviewer_type: "admin",
    status: action,
    findings: findings,
  });

  if (reviewInsert.error) {
    return NextResponse.json({ error: reviewInsert.error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status: action });
}

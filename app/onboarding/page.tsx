import { OnboardingForm } from "@/components/onboarding-form";
import { requireAuth, getCurrentAppUser } from "@/lib/auth-server";
import { supabaseAdmin } from "@/lib/supabase";

export default async function OnboardingPage() {
  const session = await requireAuth();
  const appUser = await getCurrentAppUser();
  const { data: portfolio } = await supabaseAdmin
    .from("portfolios")
    .select("name, phone, whatsapp, company, designation, headline, about, website, instagram, linkedin, meeting_link, address, services, experience, education, gallery, canvas")
    .eq("uid", appUser?.uid ?? "")
    .maybeSingle();

  const storedIntake =
    portfolio?.canvas && typeof portfolio.canvas === "object" && "intakePayload" in portfolio.canvas
      ? (portfolio.canvas as { intakePayload?: Record<string, unknown> }).intakePayload
      : undefined;

  return (
    <main className="section-shell flex-1 py-8 md:py-12">
      <section className="glass-panel rounded-[2rem] p-6 md:p-8">
        <span className="eyebrow inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase">
          Shared onboarding link
        </span>
        <div className="mt-5 grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
          <div>
            <h1 className="max-w-xl text-4xl leading-tight font-semibold md:text-5xl">
              Fill the details once and let the platform generate the hosted portfolio structure.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[var(--muted)]">
              This is the single link every customer should receive. Their answers update the portfolio record, create
              a build row, and trigger DeepSeek to generate the JSON blueprint your renderer uses.
            </p>
            <div className="mt-6 page-card px-5 py-4 text-sm leading-7 text-[var(--muted)]">
              Signed in as <span className="font-semibold text-[var(--foreground)]">{session.user.email}</span>
              <br />
              Role: <span className="font-semibold text-[var(--foreground)]">{appUser?.role ?? "user"}</span>
            </div>
          </div>

          <div className="grid gap-4">
            <article className="rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,251,247,0.82)] px-5 py-5">
              <h2 className="text-xl font-semibold">What happens after submit</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                1. Your details are saved to the profile.
                <br />
                2. A portfolio build row is created.
                <br />
                3. DeepSeek generates the structured blueprint.
                <br />
                4. The hosted profile can then be published to the web.
              </p>
            </article>
          </div>
        </div>

        <div className="mt-8">
          <OnboardingForm
            defaults={{
              name: portfolio?.name ?? appUser?.name ?? session.user.name ?? "",
              phone: portfolio?.phone ?? "",
              whatsapp: portfolio?.whatsapp ?? "",
              company: portfolio?.company ?? "",
              designation: portfolio?.designation ?? "",
              headline: portfolio?.headline ?? "",
              about: portfolio?.about ?? "",
              website: portfolio?.website ?? "",
              instagram: portfolio?.instagram ?? "",
              linkedin: portfolio?.linkedin ?? "",
              meetingLink: portfolio?.meeting_link ?? "",
              address: portfolio?.address ?? "",
              servicesText: (portfolio?.services ?? []).join("\n"),
              experienceText: (portfolio?.experience ?? []).join("\n"),
              educationText: (portfolio?.education ?? []).join("\n"),
              galleryText: (portfolio?.gallery ?? []).join("\n"),
              documentLinksText: Array.isArray(storedIntake?.documentLinks)
                ? storedIntake.documentLinks.filter((item): item is string => typeof item === "string").join("\n")
                : "",
              uploadedGalleryUrls: [],
              uploadedDocuments: [],
              targetAudience: typeof storedIntake?.targetAudience === "string" ? storedIntake.targetAudience : "",
              goals: typeof storedIntake?.goals === "string" ? storedIntake.goals : "",
              stylePrompt:
                typeof (portfolio?.canvas as { stylePrompt?: unknown } | null)?.stylePrompt === "string"
                  ? ((portfolio?.canvas as { stylePrompt?: string }).stylePrompt ?? "")
                  : "Make it elegant, premium, mobile-first, and easy to trust within a few seconds.",
            }}
          />
        </div>
      </section>
    </main>
  );
}

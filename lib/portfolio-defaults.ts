import type { OnboardingInput } from "@/lib/onboarding";

export function getOnboardingDefaults({
  sessionName,
  appUserName,
  portfolio,
}: {
  sessionName: string | null;
  appUserName: string | null | undefined;
  portfolio:
    | {
        name?: string | null;
        phone?: string | null;
        whatsapp?: string | null;
        company?: string | null;
        designation?: string | null;
        headline?: string | null;
        about?: string | null;
        website?: string | null;
        instagram?: string | null;
        linkedin?: string | null;
        meeting_link?: string | null;
        address?: string | null;
        services?: string[] | null;
        experience?: string[] | null;
        education?: string[] | null;
        gallery?: string[] | null;
        canvas?: unknown;
      }
    | null
    | undefined;
}): OnboardingInput {
  const storedIntake =
    portfolio?.canvas && typeof portfolio.canvas === "object" && "intakePayload" in portfolio.canvas
      ? (portfolio.canvas as { intakePayload?: Record<string, unknown> }).intakePayload
      : undefined;

  return {
    name: portfolio?.name ?? appUserName ?? sessionName ?? "",
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
  };
}

import { z } from "zod";

function splitMultiline(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

const optionalText = z.string().max(500).optional().default("");
const uploadedDocumentSchema = z.object({
  bucket: z.string(),
  path: z.string(),
  name: z.string(),
  contentType: z.string().nullable(),
  signedUrl: z.string().optional(),
});

export const onboardingInputSchema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().max(20).optional().default(""),
  whatsapp: z.string().max(20).optional().default(""),
  company: z.string().max(120).optional().default(""),
  designation: z.string().max(120).optional().default(""),
  headline: z.string().max(140).optional().default(""),
  about: z.string().min(40).max(1200),
  website: optionalText,
  instagram: optionalText,
  linkedin: optionalText,
  meetingLink: optionalText,
  address: z.string().max(220).optional().default(""),
  servicesText: z.string().max(1200).optional().default(""),
  experienceText: z.string().max(1500).optional().default(""),
  educationText: z.string().max(1200).optional().default(""),
  galleryText: z.string().max(2000).optional().default(""),
  documentLinksText: z.string().max(2000).optional().default(""),
  uploadedGalleryUrls: z.array(z.string().url()).optional().default([]),
  uploadedDocuments: z.array(uploadedDocumentSchema).optional().default([]),
  targetAudience: z.string().max(180).optional().default(""),
  goals: z.string().max(280).optional().default(""),
  stylePrompt: z.string().min(12).max(500),
});

export type OnboardingInput = z.infer<typeof onboardingInputSchema>;

export type NormalizedOnboardingData = {
  name: string;
  phone: string | null;
  whatsapp: string | null;
  company: string | null;
  designation: string | null;
  headline: string | null;
  about: string;
  website: string | null;
  instagram: string | null;
  linkedin: string | null;
  meetingLink: string | null;
  address: string | null;
  services: string[];
  experience: string[];
  education: string[];
  gallery: string[];
  documentLinks: string[];
  uploadedDocuments: Array<z.infer<typeof uploadedDocumentSchema>>;
  targetAudience: string | null;
  goals: string | null;
  stylePrompt: string;
};

export function normalizeOnboardingInput(input: OnboardingInput): NormalizedOnboardingData {
  return {
    name: input.name.trim(),
    phone: input.phone.trim() || null,
    whatsapp: input.whatsapp.trim() || null,
    company: input.company.trim() || null,
    designation: input.designation.trim() || null,
    headline: input.headline.trim() || null,
    about: input.about.trim(),
    website: input.website.trim() || null,
    instagram: input.instagram.trim() || null,
    linkedin: input.linkedin.trim() || null,
    meetingLink: input.meetingLink.trim() || null,
    address: input.address.trim() || null,
    services: splitMultiline(input.servicesText),
    experience: splitMultiline(input.experienceText),
    education: splitMultiline(input.educationText),
    gallery: [...splitMultiline(input.galleryText), ...input.uploadedGalleryUrls],
    documentLinks: splitMultiline(input.documentLinksText),
    uploadedDocuments: input.uploadedDocuments,
    targetAudience: input.targetAudience.trim() || null,
    goals: input.goals.trim() || null,
    stylePrompt: input.stylePrompt.trim(),
  };
}

export const onboardingFieldGroups = [
  {
    title: "Identity",
    description: "Capture the person, public headline, and their core introduction.",
  },
  {
    title: "Contact",
    description: "These fields power the CTA buttons and quick contact layer.",
  },
  {
    title: "Proof",
    description: "Structured lists help the renderer create clean sections instead of messy paragraphs.",
  },
  {
    title: "Assets",
    description: "Public gallery links and supporting document links are saved for future storage automation.",
  },
  {
    title: "Direction",
    description: "This guides DeepSeek while your renderer stays in control of the final website.",
  },
] as const;

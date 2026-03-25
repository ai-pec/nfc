"use client";

import { FormEvent, useState } from "react";
import { onboardingFieldGroups, type OnboardingInput } from "@/lib/onboarding";

type OnboardingFormProps = {
  defaults: OnboardingInput;
};

type SubmissionResult = {
  publicUrl: string | null;
  build: {
    id: string;
    status: string;
  };
};

type StringFieldName = Exclude<keyof OnboardingInput, "uploadedGalleryUrls" | "uploadedDocuments">;

function fieldValue(defaults: OnboardingInput, name: StringFieldName) {
  return defaults[name] ?? "";
}

export function OnboardingForm({ defaults }: OnboardingFormProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);

  async function uploadFiles(files: File[], assetType: "media" | "document") {
    if (files.length === 0) {
      return [];
    }

    const uploadForm = new FormData();
    uploadForm.append("assetType", assetType);

    files.forEach((file) => {
      uploadForm.append("files", file);
    });

    const response = await fetch("/api/storage/upload", {
      method: "POST",
      body: uploadForm,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error ?? "Upload failed");
    }

    return data.uploads as Array<Record<string, unknown>>;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData(event.currentTarget);
      const [uploadedGallery, uploadedDocuments] = await Promise.all([
        uploadFiles(galleryFiles, "media"),
        uploadFiles(documentFiles, "document"),
      ]);
      const payload = Object.fromEntries(formData.entries());
      const response = await fetch("/api/onboarding/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          uploadedGalleryUrls: uploadedGallery
            .map((item) => (typeof item.publicUrl === "string" ? item.publicUrl : null))
            .filter(Boolean),
          uploadedDocuments,
        }),
      });

      const data = await response.json();
      setPending(false);

      if (!response.ok) {
        setError(data.error ?? "Unable to save onboarding details");
        return;
      }

      setResult({
        publicUrl: data.publicUrl ?? null,
        build: data.build,
      });
    } catch (submissionError) {
      setPending(false);
      setError(submissionError instanceof Error ? submissionError.message : "Unable to save onboarding details");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium">
          Full name
          <input
            name="name"
            required
            defaultValue={fieldValue(defaults, "name")}
            className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
          />
        </label>

        <label className="block text-sm font-medium">
          Headline
          <input
            name="headline"
            defaultValue={fieldValue(defaults, "headline")}
            className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
          />
        </label>

        <label className="block text-sm font-medium">
          Company
          <input
            name="company"
            defaultValue={fieldValue(defaults, "company")}
            className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
          />
        </label>

        <label className="block text-sm font-medium">
          Designation
          <input
            name="designation"
            defaultValue={fieldValue(defaults, "designation")}
            className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
          />
        </label>
      </div>

      <label className="block text-sm font-medium">
        About
        <textarea
          name="about"
          required
          defaultValue={fieldValue(defaults, "about")}
          className="mt-2 min-h-36 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium">
          Phone
          <input
            name="phone"
            defaultValue={fieldValue(defaults, "phone")}
            className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
          />
        </label>

        <label className="block text-sm font-medium">
          WhatsApp
          <input
            name="whatsapp"
            defaultValue={fieldValue(defaults, "whatsapp")}
            className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
          />
        </label>

        <label className="block text-sm font-medium">
          Website
          <input
            name="website"
            defaultValue={fieldValue(defaults, "website")}
            className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
          />
        </label>

        <label className="block text-sm font-medium">
          Meeting link
          <input
            name="meetingLink"
            defaultValue={fieldValue(defaults, "meetingLink")}
            className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
          />
        </label>

        <label className="block text-sm font-medium">
          Instagram
          <input
            name="instagram"
            defaultValue={fieldValue(defaults, "instagram")}
            className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
          />
        </label>

        <label className="block text-sm font-medium">
          LinkedIn
          <input
            name="linkedin"
            defaultValue={fieldValue(defaults, "linkedin")}
            className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
          />
        </label>
      </div>

      <label className="block text-sm font-medium">
        Address
        <textarea
          name="address"
          defaultValue={fieldValue(defaults, "address")}
          className="mt-2 min-h-24 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block text-sm font-medium">
          Services
          <textarea
            name="servicesText"
            defaultValue={fieldValue(defaults, "servicesText")}
            className="mt-2 min-h-36 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
          />
        </label>

        <label className="block text-sm font-medium">
          Experience
          <textarea
            name="experienceText"
            defaultValue={fieldValue(defaults, "experienceText")}
            className="mt-2 min-h-36 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
          />
        </label>

        <label className="block text-sm font-medium">
          Education
          <textarea
            name="educationText"
            defaultValue={fieldValue(defaults, "educationText")}
            className="mt-2 min-h-36 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium">
          Upload gallery photos
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(event) => setGalleryFiles(Array.from(event.target.files ?? []))}
            className="mt-2 block w-full text-sm text-[var(--muted)]"
          />
        </label>

        <label className="block text-sm font-medium">
          Upload documents
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={(event) => setDocumentFiles(Array.from(event.target.files ?? []))}
            className="mt-2 block w-full text-sm text-[var(--muted)]"
          />
        </label>

        <label className="block text-sm font-medium">
          Public gallery image URLs
          <textarea
            name="galleryText"
            defaultValue={fieldValue(defaults, "galleryText")}
            className="mt-2 min-h-28 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
          />
        </label>

        <label className="block text-sm font-medium">
          Document URLs
          <textarea
            name="documentLinksText"
            defaultValue={fieldValue(defaults, "documentLinksText")}
            className="mt-2 min-h-28 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium">
          Target audience
          <input
            name="targetAudience"
            defaultValue={fieldValue(defaults, "targetAudience")}
            className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
          />
        </label>

        <label className="block text-sm font-medium">
          Conversion goal
          <input
            name="goals"
            defaultValue={fieldValue(defaults, "goals")}
            className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
          />
        </label>
      </div>

      <label className="block text-sm font-medium">
        AI design direction
        <textarea
          name="stylePrompt"
          required
          defaultValue={fieldValue(defaults, "stylePrompt")}
          className="mt-2 min-h-28 w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 outline-none"
        />
      </label>

      <div className="page-card px-5 py-4 text-sm leading-7 text-[var(--muted)]">
        {onboardingFieldGroups.map((group) => (
          <p key={group.title}>
            <span className="font-semibold text-[var(--foreground)]">{group.title}:</span> {group.description}
          </p>
        ))}
        <p>
          <span className="font-semibold text-[var(--foreground)]">Uploads:</span> gallery photos go to the public
          media bucket, while documents stay in the private documents bucket.
        </p>
      </div>

      {error ? <p className="text-sm text-[var(--brand-deep)]">{error}</p> : null}

      {result ? (
        <div className="page-card px-5 py-4 text-sm leading-7 text-[var(--muted)]">
          Build created: <span className="font-semibold text-[var(--foreground)]">{result.build.id}</span>
          <br />
          Status: <span className="font-semibold text-[var(--foreground)]">{result.build.status}</span>
          <br />
          Public URL:{" "}
          {result.publicUrl ? (
            <a href={result.publicUrl} target="_blank" rel="noreferrer" className="font-semibold text-[var(--brand-deep)]">
              {result.publicUrl}
            </a>
          ) : (
            "Will appear after publishing"
          )}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--brand-deep)] disabled:opacity-60"
      >
        {pending ? "Saving and generating..." : "Save details and generate portfolio"}
      </button>
    </form>
  );
}

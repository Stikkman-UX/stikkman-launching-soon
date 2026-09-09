import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getCaseStudySectionForAdmin } from "@/lib/api/caseStudies";
import type { AdminCaseStudySectionDoc, CaseStudySection } from "@/lib/api/types";
import SectionEditor from "../../../pages/components/SectionEditor";
import BackLink from "../../../components/BackLink";
import { CASE_STUDY_SECTIONS, isCaseStudySection } from "../../sectionFields";

type SectionParams = Promise<{ id: string; section: string }>;

export async function generateMetadata({
  params,
}: {
  params: SectionParams;
}): Promise<Metadata> {
  const { section } = await params;
  const label = isCaseStudySection(section)
    ? CASE_STUDY_SECTIONS[section].label
    : "Section";

  return { title: `${label} — Admin` };
}

// Kept separate from the component body per `react-hooks/error-boundaries`
// — see the same pattern in `../../../pages/[page]/[section]/page.tsx` for why.
async function loadSection(id: string, section: CaseStudySection) {
  try {
    return await getCaseStudySectionForAdmin(id, section);
  } catch (error) {
    // A 401 here means the 15min access token expired mid-session, not that
    // something is broken — send the admin back to sign in.
    if (error instanceof ApiError && error.status === 401) {
      redirect("/admin/login");
    }
    throw error;
  }
}

/**
 * Pre-seeds 3 blank outcome rows so the admin isn't forced to click "Add
 * outcome point" three times before the backend's `min(3)` save requirement
 * can even be satisfied — the section's own defaults come back as `points: []`
 * since case studies have no prior static copy to seed a placeholder from.
 */
function withSeededOutcomes(
  section: CaseStudySection,
  doc: AdminCaseStudySectionDoc
): AdminCaseStudySectionDoc {
  if (section !== "outcomes") return doc;

  const points = Array.isArray(doc.content.points) ? doc.content.points : [];
  if (points.length >= 3) return doc;

  const padded = [...points];
  while (padded.length < 3) padded.push({ value: "", label: "" });

  return { ...doc, content: { ...doc.content, points: padded } };
}

export default async function CaseStudySectionEditorPage({
  params,
}: {
  params: SectionParams;
}) {
  const { id, section } = await params;

  if (!isCaseStudySection(section)) {
    notFound();
  }

  const descriptor = CASE_STUDY_SECTIONS[section];
  const doc = withSeededOutcomes(section, await loadSection(id, section));

  return (
    <div className="flex flex-col gap-8">
      <BackLink href={`/admin/case-studies/${id}`} label="Back to case study" />

      <div>
        <h1 className="text-2xl text-neutral-900">{descriptor.label}</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {doc.exists
            ? "Editing saved content."
            : "Not saved yet — fill in and save to publish this section."}
        </p>
      </div>

      <SectionEditor
        fields={descriptor.fields}
        doc={doc}
        showPublishToggle={false}
        target={{ kind: "caseStudy", caseStudyId: id, section }}
      />
    </div>
  );
}

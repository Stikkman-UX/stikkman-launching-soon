import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getSectorSectionForAdmin } from "@/lib/api/sectors";
import type { SectorSection } from "@/lib/api/types";
import SectionEditor from "../../../pages/components/SectionEditor";
import BackLink from "../../../components/BackLink";
import { SECTOR_SECTIONS, isSectorSection } from "../../sectionFields";

type SectionParams = Promise<{ id: string; section: string }>;

export async function generateMetadata({
  params,
}: {
  params: SectionParams;
}): Promise<Metadata> {
  const { section } = await params;
  const label = isSectorSection(section)
    ? SECTOR_SECTIONS[section].label
    : "Section";

  return { title: `${label} — Admin` };
}

// Kept separate from the component body per `react-hooks/error-boundaries`
// — see the same pattern in `../../../pages/[page]/[section]/page.tsx` for why.
async function loadSection(id: string, section: SectorSection) {
  try {
    return await getSectorSectionForAdmin(id, section);
  } catch (error) {
    // A 401 here means the 15min access token expired mid-session, not that
    // something is broken — send the admin back to sign in.
    if (error instanceof ApiError && error.status === 401) {
      redirect("/admin/login");
    }
    throw error;
  }
}

export default async function SectorSectionEditorPage({
  params,
}: {
  params: SectionParams;
}) {
  const { id, section } = await params;

  if (!isSectorSection(section)) {
    notFound();
  }

  const descriptor = SECTOR_SECTIONS[section];
  const doc = await loadSection(id, section);

  return (
    <div className="flex flex-col gap-8">
      <BackLink href={`/admin/sectors/${id}`} label="Back to sector" />

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
        target={{ kind: "sector", sectorId: id, section }}
      />
    </div>
  );
}

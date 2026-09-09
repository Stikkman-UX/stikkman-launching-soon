import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getServiceSectionForAdmin } from "@/lib/api/services";
import type { ServiceSection } from "@/lib/api/types";
import SectionEditor from "../../../pages/components/SectionEditor";
import BackLink from "../../../components/BackLink";
import { SERVICE_SECTIONS, isServiceSection } from "../../sectionFields";

type SectionParams = Promise<{ id: string; section: string }>;

export async function generateMetadata({
  params,
}: {
  params: SectionParams;
}): Promise<Metadata> {
  const { section } = await params;
  const label = isServiceSection(section)
    ? SERVICE_SECTIONS[section].label
    : "Section";

  return { title: `${label} — Admin` };
}

// Kept separate from the component body per `react-hooks/error-boundaries`
// — see the same pattern in `../../../sectors/[id]/[section]/page.tsx` for why.
async function loadSection(id: string, section: ServiceSection) {
  try {
    return await getServiceSectionForAdmin(id, section);
  } catch (error) {
    // A 401 here means the 15min access token expired mid-session, not that
    // something is broken — send the admin back to sign in.
    if (error instanceof ApiError && error.status === 401) {
      redirect("/admin/login");
    }
    throw error;
  }
}

export default async function ServiceSectionEditorPage({
  params,
}: {
  params: SectionParams;
}) {
  const { id, section } = await params;

  if (!isServiceSection(section)) {
    notFound();
  }

  const descriptor = SERVICE_SECTIONS[section];
  const doc = await loadSection(id, section);

  return (
    <div className="flex flex-col gap-8">
      <BackLink href={`/admin/services/${id}`} label="Back to service" />

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
        target={{ kind: "service", serviceId: id, section }}
      />
    </div>
  );
}

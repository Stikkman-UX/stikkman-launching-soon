import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getNavigationSectionForAdmin } from "@/lib/api/navigation";
import type { NavigationSection } from "@/lib/api/types";
import SectionEditor from "../../pages/components/SectionEditor";
import BackLink from "../../components/BackLink";
import { NAVIGATION_SECTIONS, isNavigationSection } from "../sectionFields";

type SectionParams = Promise<{ section: string }>;

export async function generateMetadata({
  params,
}: {
  params: SectionParams;
}): Promise<Metadata> {
  const { section } = await params;
  const label = isNavigationSection(section)
    ? NAVIGATION_SECTIONS[section].label
    : "Section";

  return { title: `${label} — Admin` };
}

// Kept separate from the component body per `react-hooks/error-boundaries`
// — see the same pattern in `../../sectors/[id]/[section]/page.tsx` for why.
async function loadSection(section: NavigationSection) {
  try {
    return await getNavigationSectionForAdmin(section);
  } catch (error) {
    // A 401 here means the 15min access token expired mid-session, not that
    // something is broken — send the admin back to sign in.
    if (error instanceof ApiError && error.status === 401) {
      redirect("/admin/login");
    }
    throw error;
  }
}

export default async function NavigationSectionEditorPage({
  params,
}: {
  params: SectionParams;
}) {
  const { section } = await params;

  if (!isNavigationSection(section)) {
    notFound();
  }

  const descriptor = NAVIGATION_SECTIONS[section];
  const doc = await loadSection(section);

  return (
    <div className="flex flex-col gap-8">
      <BackLink href="/admin/navigation" label="Back to Navigation" />

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
        target={{ kind: "navigation", section }}
      />
    </div>
  );
}

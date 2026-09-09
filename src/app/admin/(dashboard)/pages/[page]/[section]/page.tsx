import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { findAdminPage, findAdminSection } from "@/lib/admin/navigation";
import { ApiError } from "@/lib/api/client";
import { getSectionForAdmin } from "@/lib/api/pages";
import SectionEditor from "../../components/SectionEditor";
import { SECTION_FIELDS } from "../../sectionFields";

type SectionParams = Promise<{ page: string; section: string }>;

export async function generateMetadata({
  params,
}: {
  params: SectionParams;
}): Promise<Metadata> {
  const { page, section } = await params;
  const adminPage = findAdminPage(page);
  const adminSection = adminPage
    ? findAdminSection(adminPage, section)
    : undefined;

  return { title: adminSection ? `${adminSection.label} — Admin` : "Admin" };
}

// Kept separate from the component body per `react-hooks/error-boundaries`
// — see the same pattern in `../../../projects/page.tsx` for why.
async function loadSection(page: string, section: string) {
  try {
    return await getSectionForAdmin(page, section);
  } catch (error) {
    // A 401 here means the 15min access token expired mid-session, not that
    // something is broken — send the admin back to sign in.
    if (error instanceof ApiError && error.status === 401) {
      redirect("/admin/login");
    }
    throw error;
  }
}

export default async function SectionEditorPage({
  params,
}: {
  params: SectionParams;
}) {
  const { page, section } = await params;

  const adminPage = findAdminPage(page);
  const adminSection = adminPage
    ? findAdminSection(adminPage, section)
    : undefined;
  const fields = SECTION_FIELDS[page]?.[section];

  // `custom` entries (Projects) live on their own routes, so they have no
  // generic editor here.
  if (!adminSection || adminSection.kind !== "page-section" || !fields) {
    notFound();
  }

  const doc = await loadSection(page, section);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl text-neutral-900">{adminSection.label}</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {doc.exists && doc.updatedAt
            ? `Last updated ${new Date(doc.updatedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}.`
            : "Not saved to the CMS yet — pre-filled with the copy currently live on the site."}
        </p>
      </div>

      <SectionEditor
        fields={fields}
        doc={doc}
        target={{ kind: "page", page, section }}
      />
    </div>
  );
}

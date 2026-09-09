import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getAdminSector, listSectorSections } from "@/lib/api/sectors";
import BackLink from "../../components/BackLink";
import SectorHeroTitleForm from "./components/SectorHeroTitleForm";

export const metadata: Metadata = {
  title: "Sector — Admin",
};

// Kept separate from the component body per `react-hooks/error-boundaries`
// — see the same pattern in `../page.tsx` for why.
async function loadHub(id: string) {
  try {
    return await Promise.all([getAdminSector(id), listSectorSections(id)]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/admin/login");
    }
    throw error;
  }
}

/**
 * Identity + the editable Hero heading + a hub of 10 section links (label +
 * filled-in/not-started state). Publish/reorder/delete stay on the board;
 * `name`/`slug` are immutable after creation.
 */
export default async function SectorHubPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [sector, sections] = await loadHub(id);

  return (
    <div className="flex flex-col gap-8">
      <BackLink href="/admin/sectors" label="Back to Sectors" />

      <div>
        <h1 className="text-2xl text-neutral-900">{sector.name}</h1>
        <p className="mt-1 text-sm text-neutral-500">
          /{sector.slug} · {sector.isPublished ? "Published" : "Draft"}
        </p>
      </div>

      <SectorHeroTitleForm sectorId={id} heroTitle={sector.heroTitle} />

      <ul className="flex flex-col gap-3">
        {sections.map((section) => (
          <li key={section.section}>
            <Link
              href={`/admin/sectors/${id}/${section.section}`}
              className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-4 text-sm text-neutral-900 transition-colors hover:border-neutral-900"
            >
              <span>{section.label}</span>
              <span className="text-xs uppercase tracking-wide text-neutral-400">
                {section.exists ? "Filled in" : "Not started"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

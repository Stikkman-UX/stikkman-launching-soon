import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getAdminService, listServiceSections } from "@/lib/api/services";
import BackLink from "../../components/BackLink";

export const metadata: Metadata = {
  title: "Service — Admin",
};

// Kept separate from the component body per `react-hooks/error-boundaries`
// — see the same pattern in `../page.tsx` for why.
async function loadHub(id: string) {
  try {
    return await Promise.all([getAdminService(id), listServiceSections(id)]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/admin/login");
    }
    throw error;
  }
}

/**
 * Identity header + a hub of 7 section links (label + filled-in/not-started
 * state). Publish/reorder/delete stay on the board; `name`/`slug` are
 * immutable after creation. Unlike Sector's hub, there is no standalone Hero
 * heading form here — all Hero content lives inside the `hero` section.
 */
export default async function ServiceHubPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [service, sections] = await loadHub(id);

  return (
    <div className="flex flex-col gap-8">
      <BackLink href="/admin/services" label="Back to Services" />

      <div>
        <h1 className="text-2xl text-neutral-900">{service.name}</h1>
        <p className="mt-1 text-sm text-neutral-500">
          /{service.slug} · {service.isPublished ? "Published" : "Draft"}
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {sections.map((section) => (
          <li key={section.section}>
            <Link
              href={`/admin/services/${id}/${section.section}`}
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

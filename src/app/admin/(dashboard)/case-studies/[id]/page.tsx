import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getAdminCaseStudy, listCaseStudySections } from "@/lib/api/caseStudies";
import BackLink from "../../components/BackLink";

export const metadata: Metadata = {
  title: "Case Study — Admin",
};

// Kept separate from the component body per `react-hooks/error-boundaries`
// — see the same pattern in `../page.tsx` for why.
async function loadHub(id: string) {
  try {
    return await Promise.all([
      getAdminCaseStudy(id),
      listCaseStudySections(id),
    ]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/admin/login");
    }
    throw error;
  }
}

/**
 * Identity + a hub of 6 section links (label + filled-in/not-started state).
 * Read-only chrome — publish/title editing stays on the board.
 */
export default async function CaseStudyHubPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [caseStudy, sections] = await loadHub(id);

  return (
    <div className="flex flex-col gap-8">
      <BackLink href="/admin/case-studies" label="Back to Case Studies" />

      <div>
        <h1 className="text-2xl text-neutral-900">{caseStudy.title}</h1>
        <p className="mt-1 text-sm text-neutral-500">
          /work/{caseStudy.slug} ·{" "}
          {caseStudy.isPublished ? "Published" : "Draft"}
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {sections.map((section) => (
          <li key={section.section}>
            <Link
              href={`/admin/case-studies/${id}/${section.section}`}
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

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { listAdminCaseStudies } from "@/lib/api/caseStudies";
import CaseStudiesAdminBoard from "./components/CaseStudiesAdminBoard";

export const metadata: Metadata = {
  title: "Case Studies — Admin",
};

// Kept separate from the component body per `react-hooks/error-boundaries`
// — see the same pattern in `../projects/page.tsx` for why.
async function loadCaseStudies() {
  try {
    return await listAdminCaseStudies();
  } catch (error) {
    // A 401 here means the 15min access token expired mid-session, not that
    // something is broken — send the admin back to sign in.
    if (error instanceof ApiError && error.status === 401) {
      redirect("/admin/login");
    }
    throw error;
  }
}

export default async function AdminCaseStudiesPage() {
  const caseStudies = await loadCaseStudies();

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl text-neutral-900">Case Studies</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage the case study detail pages shown at /work/[slug].
        </p>
      </div>

      <CaseStudiesAdminBoard initialCaseStudies={caseStudies} />
    </div>
  );
}

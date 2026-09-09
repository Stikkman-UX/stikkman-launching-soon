import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { listAdminProjects } from "@/lib/api/projects";
import type { ProjectSection } from "@/lib/api/types";
import ProjectsAdminBoard from "./components/ProjectsAdminBoard";

export const metadata: Metadata = {
  title: "Projects — Admin",
};

// Kept separate from the component body (rather than wrapping the JSX
// return in try/catch) per `react-hooks/error-boundaries` — JSX
// construction inside try/catch doesn't actually catch render errors, only
// synchronous throws during construction, which is misleading here since
// the redirect needs to happen before any JSX is built at all.
async function loadProjects() {
  try {
    return await listAdminProjects();
  } catch (error) {
    // The access token can expire mid-session (15min TTL, no refresh-token
    // rotation in scope) — a 401 here means the session is stale, not that
    // something is actually broken, so send the admin back to sign in.
    if (error instanceof ApiError && error.status === 401) {
      redirect("/admin/login");
    }
    throw error;
  }
}

// Same shape as `new/page.tsx` — the sidebar's Projects One/Two entries link
// here with `?section=`, but no param still means "show everything".
function resolveSection(value: string | string[] | undefined): ProjectSection | undefined {
  return value === "one" || value === "two" ? value : undefined;
}

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string | string[] }>;
}) {
  const [projects, params] = await Promise.all([loadProjects(), searchParams]);
  const section = resolveSection(params.section);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl text-neutral-900">Projects</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage the cards shown in the Home page&apos;s Projects section.
        </p>
      </div>

      <ProjectsAdminBoard
        initialProjects={projects}
        visibleSections={section ? [section] : undefined}
      />
    </div>
  );
}

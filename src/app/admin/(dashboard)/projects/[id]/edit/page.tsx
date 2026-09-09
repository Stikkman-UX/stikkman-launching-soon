import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getAdminProject } from "@/lib/api/projects";
import BackLink from "../../../components/BackLink";
import ProjectForm from "../../components/ProjectForm";

export const metadata: Metadata = {
  title: "Edit Project — Admin",
};

// Kept separate from the component body per `react-hooks/error-boundaries`
// — see the same pattern in `../page.tsx` for why.
async function loadProject(id: string) {
  try {
    return await getAdminProject(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/admin/login");
    }
    throw error;
  }
}

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await loadProject(id);

  return (
    <div className="flex flex-col gap-8">
      <BackLink href="/admin/projects" label="Back to Projects" />

      <div>
        <h1 className="text-2xl text-neutral-900">Edit project</h1>
        <p className="mt-1 text-sm text-neutral-500">{project.title}</p>
      </div>

      <ProjectForm mode="edit" project={project} />
    </div>
  );
}

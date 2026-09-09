import type { Metadata } from "next";
import type { ProjectSection } from "@/lib/api/types";
import BackLink from "../../components/BackLink";
import ProjectForm from "../components/ProjectForm";

export const metadata: Metadata = {
  title: "New Project — Admin",
};

function resolveSection(value: string | string[] | undefined): ProjectSection | undefined {
  return value === "one" || value === "two" ? value : undefined;
}

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string | string[] }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex flex-col gap-8">
      <BackLink href="/admin/projects" label="Back to Projects" />

      <div>
        <h1 className="text-2xl text-neutral-900">New project</h1>
        <p className="mt-1 text-sm text-neutral-500">Add a new card to the Home page.</p>
      </div>

      <ProjectForm mode="create" initialSection={resolveSection(params.section)} />
    </div>
  );
}

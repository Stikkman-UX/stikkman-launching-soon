import { notFound, redirect } from "next/navigation";
import { findAdminPage, sectionHref } from "@/lib/admin/navigation";

// A page has no editor of its own — it's just a bucket of sections.
export default async function AdminPageIndexPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const adminPage = findAdminPage(page);

  if (!adminPage) {
    notFound();
  }

  redirect(sectionHref(adminPage.slug, adminPage.sections[0]));
}

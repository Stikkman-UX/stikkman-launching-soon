import { redirect } from "next/navigation";
import { DEFAULT_ADMIN_PAGE, sectionHref } from "@/lib/admin/navigation";

// The dashboard has no landing view of its own — drop straight into the
// first section of the first page.
export default function AdminDashboardIndexPage() {
  redirect(sectionHref(DEFAULT_ADMIN_PAGE.slug, DEFAULT_ADMIN_PAGE.sections[0]));
}

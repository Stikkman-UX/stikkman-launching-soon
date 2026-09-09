import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { listNavigationSections } from "@/lib/api/navigation";

export const metadata: Metadata = {
  title: "Navigation — Admin",
};

// Kept separate from the component body per `react-hooks/error-boundaries`
// — see the same pattern in `../sectors/[id]/page.tsx` for why.
async function loadHub() {
  try {
    return await listNavigationSections();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/admin/login");
    }
    throw error;
  }
}

/**
 * No identity/publish form here — unlike `Sector`, `Navigation` is a
 * singleton with no name/slug/publish state of its own, just a hub of 4
 * section links (label + filled-in/not-started state).
 */
export default async function NavigationHubPage() {
  const sections = await loadHub();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl text-neutral-900">Navigation</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manages the header nav, the sectors dropdown, and the footer&apos;s
          social links.
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {sections.map((section) => (
          <li key={section.section}>
            <Link
              href={`/admin/navigation/${section.section}`}
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

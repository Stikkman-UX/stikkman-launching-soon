import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { listAboutUsSections } from "@/lib/api/aboutUs";

export const metadata: Metadata = {
  title: "About Us — Admin",
};

// Kept separate from the component body per `react-hooks/error-boundaries`
// — see the same pattern in `../navigation/page.tsx` for why.
async function loadHub() {
  try {
    return await listAboutUsSections();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/admin/login");
    }
    throw error;
  }
}

/**
 * No identity/publish form here — like `Navigation`, `AboutUs` is a
 * singleton with no name/slug/publish state of its own, just a hub of 7
 * section links (label + filled-in/not-started state).
 */
export default async function AboutUsHubPage() {
  const sections = await loadHub();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl text-neutral-900">About Us</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manages the About Us page — hero, stats, company highlight, and the
          rest of its fixed sections.
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {sections.map((section) => (
          <li key={section.section}>
            <Link
              href={`/admin/about-us/${section.section}`}
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

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getSectionForAdmin } from "@/lib/api/pages";
import { listAdminShowcaseCards } from "@/lib/api/showcaseCards";
import SectionEditor from "../pages/components/SectionEditor";
import { SECTION_FIELDS } from "../pages/sectionFields";
import ShowcaseCardsAdminBoard from "./components/ShowcaseCardsAdminBoard";

export const metadata: Metadata = {
  title: "Work & Innovation Cards — Admin",
};

// Kept separate from the component body per `react-hooks/error-boundaries`
// — see the same pattern in `../case-studies/page.tsx` for why.
async function loadShowcaseCards() {
  try {
    return await listAdminShowcaseCards();
  } catch (error) {
    // A 401 here means the 15min access token expired mid-session, not that
    // something is broken — send the admin back to sign in.
    if (error instanceof ApiError && error.status === 401) {
      redirect("/admin/login");
    }
    throw error;
  }
}

// Same 401 handling as `loadShowcaseCards` — both requests hit this page, so
// either one hitting an expired access token should bounce to login.
async function loadDescriptionSection() {
  try {
    return await getSectionForAdmin("work", "header");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/admin/login");
    }
    throw error;
  }
}

export default async function AdminShowcaseCardsPage() {
  const [cards, descriptionDoc] = await Promise.all([
    loadShowcaseCards(),
    loadDescriptionSection(),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl text-neutral-900">Work & Innovation Cards</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage the sector-filterable case-study cards shown at /work.
        </p>
      </div>

      {/* The intro copy above the card grid on /work-innovation — a
          `PageSection` document (page "work", section "header") edited
          inline here rather than on its own route, since it's this board's
          only piece of surrounding page copy. */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="text-lg text-neutral-900">Description</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Shown beneath the "Work & Innovation" heading at /work-innovation.
        </p>

        <div className="mt-6">
          <SectionEditor
            fields={SECTION_FIELDS.work.header}
            doc={descriptionDoc}
            target={{ kind: "page", page: "work", section: "header" }}
          />
        </div>
      </div>

      <ShowcaseCardsAdminBoard initialCards={cards} />
    </div>
  );
}

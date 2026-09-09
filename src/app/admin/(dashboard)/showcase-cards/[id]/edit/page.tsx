import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { getAdminShowcaseCard } from "@/lib/api/showcaseCards";
import BackLink from "../../../components/BackLink";
import ShowcaseCardForm from "../../components/ShowcaseCardForm";

export const metadata: Metadata = {
  title: "Edit Showcase Card — Admin",
};

// Kept separate from the component body per `react-hooks/error-boundaries`
// — see the same pattern in `../page.tsx` for why.
async function loadShowcaseCard(id: string) {
  try {
    return await getAdminShowcaseCard(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/admin/login");
    }
    throw error;
  }
}

export default async function EditShowcaseCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const card = await loadShowcaseCard(id);

  return (
    <div className="flex flex-col gap-8">
      <BackLink href="/admin/showcase-cards" label="Back to Work & Innovation Cards" />

      <div>
        <h1 className="text-2xl text-neutral-900">Edit showcase card</h1>
        <p className="mt-1 text-sm text-neutral-500">{card.title}</p>
      </div>

      <ShowcaseCardForm mode="edit" card={card} />
    </div>
  );
}

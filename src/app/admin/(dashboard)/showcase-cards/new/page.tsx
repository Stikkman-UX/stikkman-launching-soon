import type { Metadata } from "next";
import BackLink from "../../components/BackLink";
import ShowcaseCardForm from "../components/ShowcaseCardForm";

export const metadata: Metadata = {
  title: "New Showcase Card — Admin",
};

export default function NewShowcaseCardPage() {
  return (
    <div className="flex flex-col gap-8">
      <BackLink href="/admin/showcase-cards" label="Back to Work & Innovation Cards" />

      <div>
        <h1 className="text-2xl text-neutral-900">New showcase card</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Add a new card to the Work & Innovation page.
        </p>
      </div>

      <ShowcaseCardForm mode="create" />
    </div>
  );
}

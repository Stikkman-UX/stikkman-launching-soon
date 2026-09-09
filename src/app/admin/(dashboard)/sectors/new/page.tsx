import type { Metadata } from "next";
import BackLink from "../../components/BackLink";
import SectorCreateForm from "./components/SectorCreateForm";

export const metadata: Metadata = {
  title: "New Sector — Admin",
};

export default function NewSectorPage() {
  return (
    <div className="flex flex-col gap-8">
      <BackLink href="/admin/sectors" label="Back to Sectors" />

      <div>
        <h1 className="text-2xl text-neutral-900">New sector</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Give it a name and background asset to get started — the 10
          sections can be filled in afterwards, one at a time.
        </p>
      </div>

      <SectorCreateForm />
    </div>
  );
}

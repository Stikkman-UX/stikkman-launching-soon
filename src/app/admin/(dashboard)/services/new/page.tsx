import type { Metadata } from "next";
import BackLink from "../../components/BackLink";
import ServiceCreateForm from "./components/ServiceCreateForm";

export const metadata: Metadata = {
  title: "New Service — Admin",
};

export default function NewServicePage() {
  return (
    <div className="flex flex-col gap-8">
      <BackLink href="/admin/services" label="Back to Services" />

      <div>
        <h1 className="text-2xl text-neutral-900">New service</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Give it a name and background asset to get started — the 7 sections
          can be filled in afterwards, one at a time.
        </p>
      </div>

      <ServiceCreateForm />
    </div>
  );
}

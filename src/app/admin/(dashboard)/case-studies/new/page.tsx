import type { Metadata } from "next";
import BackLink from "../../components/BackLink";
import CaseStudyCreateForm from "./components/CaseStudyCreateForm";

export const metadata: Metadata = {
  title: "New Case Study — Admin",
};

export default function NewCaseStudyPage() {
  return (
    <div className="flex flex-col gap-8">
      <BackLink href="/admin/case-studies" label="Back to Case Studies" />

      <div>
        <h1 className="text-2xl text-neutral-900">New case study</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Give it a title to get started — the 6 sections can be filled in
          afterwards, one at a time.
        </p>
      </div>

      <CaseStudyCreateForm />
    </div>
  );
}

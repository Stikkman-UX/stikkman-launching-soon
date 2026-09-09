"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createCaseStudy } from "@/lib/api/caseStudies";
import { resolveErrorMessage } from "@/lib/api/errors";

/**
 * Title-only create — unlike `ProjectForm`, which captures everything up
 * front, a case study is created bare and routed straight into its section
 * hub (`/admin/case-studies/[id]`) to fill in Hero/Overview/etc. one at a
 * time.
 */
export default function CaseStudyCreateForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const caseStudy = await createCaseStudy({ title: title.trim() });
      router.push(`/admin/case-studies/${caseStudy.id}`);
      router.refresh();
    } catch (err) {
      setError(resolveErrorMessage(err));
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex max-w-2xl flex-col gap-6">
      <label className="flex flex-col gap-2 text-sm text-neutral-700">
        Title
        <input
          type="text"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900"
        />
      </label>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-neutral-900 px-6 py-3 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Create case study"}
        </button>

        <Link
          href="/admin/case-studies"
          className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

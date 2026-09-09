"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_PAGES, isPageActive, sectionHref } from "@/lib/admin/navigation";

/** Header level of the admin IA: one tab per website page. */
export default function AdminPageTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Pages" className="flex items-center gap-6 text-sm">
      {ADMIN_PAGES.map((page) => {
        const isActive = isPageActive(page, pathname);

        return (
          <Link
            key={page.slug}
            href={sectionHref(page.slug, page.sections[0])}
            aria-current={isActive ? "page" : undefined}
            className={`transition-colors ${
              isActive
                ? "text-neutral-900"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            {page.label}
          </Link>
        );
      })}
    </nav>
  );
}

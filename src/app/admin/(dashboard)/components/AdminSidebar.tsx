"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ADMIN_PAGES,
  DEFAULT_ADMIN_PAGE,
  isPageActive,
  isSectionActive,
  sectionHref,
  type AdminPage,
} from "@/lib/admin/navigation";

/**
 * Rendered twice — a horizontally scrollable pill row below `lg` and a
 * vertical list at `lg`+ — so labels and order can't diverge between the two.
 */
function SectionNavList({
  page,
  pathname,
  searchParams,
  orientation,
}: {
  page: AdminPage;
  pathname: string;
  searchParams: URLSearchParams;
  orientation: "horizontal" | "vertical";
}) {
  const isVertical = orientation === "vertical";

  return (
    <>
      {page.sections.map((section) => {
        const isActive = isSectionActive(
          section,
          page.slug,
          pathname,
          searchParams
        );

        return (
          <Link
            key={section.slug}
            href={sectionHref(page.slug, section)}
            aria-current={isActive ? "page" : undefined}
            className={`${
              isVertical
                ? "rounded-lg px-3 py-2 text-sm"
                : "shrink-0 snap-start rounded-full border px-4 py-2 text-xs whitespace-nowrap"
            } transition-colors ${
              isActive
                ? "bg-neutral-900 text-white" +
                  (isVertical ? "" : " border-neutral-900")
                : "text-neutral-500 hover:text-neutral-900" +
                  (isVertical ? "" : " border-neutral-300 bg-white")
            }`}
          >
            {section.label}
          </Link>
        );
      })}
    </>
  );
}

/**
 * Left panel of the admin IA: the sections of whichever page the current URL
 * belongs to. A pure function of `ADMIN_PAGES` + the URL — it fetches
 * nothing, so it can't slow the layout down or hardcode a page slug.
 */
export default function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page =
    ADMIN_PAGES.find((candidate) => isPageActive(candidate, pathname)) ??
    DEFAULT_ADMIN_PAGE;

  return (
    <>
      {/* Bleeds to the gutter edge while keeping the first pill on the grid. */}
      <nav
        aria-label="Sections"
        className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 lg:hidden"
      >
        <SectionNavList
          page={page}
          pathname={pathname}
          searchParams={searchParams}
          orientation="horizontal"
        />
      </nav>

      <nav
        aria-label="Sections"
        className="hidden lg:sticky lg:top-24 lg:flex lg:w-56 lg:shrink-0 lg:flex-col lg:gap-1"
      >
        <SectionNavList
          page={page}
          pathname={pathname}
          searchParams={searchParams}
          orientation="vertical"
        />
      </nav>
    </>
  );
}

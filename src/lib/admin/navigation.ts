/**
 * Single source of truth for the two-level admin IA: the header lists website
 * pages, the left panel lists that page's sections. Lives in `src/lib` so the
 * Server layout and the Client nav components can both import it.
 */

export type AdminSection = { slug: string; label: string } & (
  | { kind: "page-section" }
  /** Backed by its own resource and its own routes (Projects). */
  | { kind: "custom"; href: string }
);

export type AdminPage = {
  slug: string;
  label: string;
  sections: AdminSection[];
};

/**
 * ORDER MUST MIRROR `src/app/page.tsx` — the sidebar is a map of the live
 * page. Adding a page means one entry here plus its backend registry entry.
 */
export const ADMIN_PAGES: AdminPage[] = [
  {
    slug: "home",
    label: "Home",
    sections: [
      { kind: "page-section", slug: "hero", label: "Hero" },
      { kind: "page-section", slug: "projectsIntro", label: "Projects Intro" },
      {
        kind: "custom",
        slug: "projectsOne",
        label: "Projects One",
        href: "/admin/projects?section=one",
      },
      // The sticky label beside each projects list is its own tiny section —
      // the cards themselves live in the separate Projects resource above.
      {
        kind: "page-section",
        slug: "projectsOneTag",
        label: "Projects One Tag",
      },
      { kind: "page-section", slug: "whyUs", label: "Why Us" },
      {
        kind: "custom",
        slug: "projectsTwo",
        label: "Projects Two",
        href: "/admin/projects?section=two",
      },
      {
        kind: "page-section",
        slug: "projectsTwoTag",
        label: "Projects Two Tag",
      },
      { kind: "page-section", slug: "capabilities", label: "Capabilities" },
      { kind: "page-section", slug: "testimonials", label: "Testimonials" },
      { kind: "page-section", slug: "designDna", label: "Design DNA" },
      { kind: "page-section", slug: "insights", label: "Insights & Articles" },
    ],
  },
  {
    slug: "work",
    label: "Work",
    sections: [
      {
        kind: "custom",
        slug: "caseStudies",
        label: "Case Studies",
        href: "/admin/case-studies",
      },
      {
        kind: "custom",
        slug: "showcaseCards",
        label: "Work & Innovation Cards",
        href: "/admin/showcase-cards",
      },
    ],
  },
  {
    slug: "sectors",
    label: "Sectors",
    sections: [
      { kind: "custom", slug: "sectors", label: "Sectors", href: "/admin/sectors" },
    ],
  },
  {
    slug: "services",
    label: "Services",
    sections: [
      { kind: "custom", slug: "services", label: "Services", href: "/admin/services" },
    ],
  },
  {
    slug: "navigation",
    label: "Navigation",
    sections: [
      {
        kind: "custom",
        slug: "topBarLinks",
        label: "Top Bar Links",
        href: "/admin/navigation/topBarLinks",
      },
      {
        kind: "custom",
        slug: "menuLinks",
        label: "Menu Links",
        href: "/admin/navigation/menuLinks",
      },
      {
        kind: "custom",
        slug: "sectorsDropdown",
        label: "Sectors Dropdown",
        href: "/admin/navigation/sectorsDropdown",
      },
      {
        kind: "custom",
        slug: "servicesDropdown",
        label: "Services Dropdown",
        href: "/admin/navigation/servicesDropdown",
      },
      {
        kind: "custom",
        slug: "socialLinks",
        label: "Social Links",
        href: "/admin/navigation/socialLinks",
      },
    ],
  },
  {
    slug: "about-us",
    label: "About Us",
    sections: [
      { kind: "custom", slug: "hero", label: "Hero", href: "/admin/about-us/hero" },
      { kind: "custom", slug: "stats", label: "Stats", href: "/admin/about-us/stats" },
      {
        kind: "custom",
        slug: "companyHighlight",
        label: "Company Highlight",
        href: "/admin/about-us/companyHighlight",
      },
      {
        kind: "custom",
        slug: "whatWeServe",
        label: "What We Serve",
        href: "/admin/about-us/whatWeServe",
      },
      {
        kind: "custom",
        slug: "process",
        label: "Process",
        href: "/admin/about-us/process",
      },
      {
        kind: "custom",
        slug: "solutions",
        label: "Solutions",
        href: "/admin/about-us/solutions",
      },
      { kind: "custom", slug: "team", label: "Team", href: "/admin/about-us/team" },
    ],
  },
];

export const DEFAULT_ADMIN_PAGE = ADMIN_PAGES[0];

export function findAdminPage(slug: string): AdminPage | undefined {
  return ADMIN_PAGES.find((page) => page.slug === slug);
}

export function findAdminSection(
  page: AdminPage,
  slug: string
): AdminSection | undefined {
  return page.sections.find((section) => section.slug === slug);
}

export function sectionHref(pageSlug: string, section: AdminSection): string {
  return section.kind === "custom"
    ? section.href
    : `/admin/pages/${pageSlug}/${section.slug}`;
}

function matchesPath(pathname: string, href: string): boolean {
  const [path] = href.split("?");
  // Prefix match so nested routes (`/admin/projects/new`) still resolve to
  // their nav entry.
  return pathname === path || pathname.startsWith(`${path}/`);
}

/**
 * Pathname-only — deliberately ignores search params so the header tabs don't
 * need the `<Suspense>` boundary `useSearchParams()` forces on the sidebar.
 */
export function isPageActive(page: AdminPage, pathname: string): boolean {
  if (pathname.startsWith(`/admin/pages/${page.slug}`)) return true;

  return page.sections.some(
    (section) => section.kind === "custom" && matchesPath(pathname, section.href)
  );
}

/**
 * Exported here rather than inlined in the sidebar so the header and the
 * section list can't drift apart.
 */
export function isSectionActive(
  section: AdminSection,
  pageSlug: string,
  pathname: string,
  searchParams: URLSearchParams
): boolean {
  if (section.kind === "page-section") {
    return pathname === sectionHref(pageSlug, section);
  }

  if (!matchesPath(pathname, section.href)) return false;

  // A custom entry is active only when every param in its href matches, so
  // bare `/admin/projects` (which lists both sections) highlights neither.
  const [, query = ""] = section.href.split("?");

  return [...new URLSearchParams(query)].every(
    ([key, value]) => searchParams.get(key) === value
  );
}

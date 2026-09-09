export type ProjectAssetItem = {
  url: string;
  type: "image" | "video";
};

// Matches the existing frontend `Project` type in
// `src/app/(Home)/data/projects.ts` field-for-field — the backend's
// `GET /api/projects/home` response is shaped to match this exactly.
export type HomeProjectCard = {
  slug: string;
  title: string;
  description: string;
  /** Always exactly 4, in 2x2 grid order: top-left, top-right, bottom-left, bottom-right. */
  assets: ProjectAssetItem[];
  /** Always resolved server-side, never empty — backend defaults it to `/404` if unset. */
  href: string;
};

export type ProjectSection = "one" | "two";

// Shape returned by `GET /api/projects` (admin list) — uses `id`.
export type AdminProject = {
  id: string;
  slug: string;
  title: string;
  description: string;
  section: ProjectSection;
  order: number;
  isPublished: boolean;
  /** Asset ids for the 4 grid slots — never raw URLs. */
  assets: string[];
  /** Resolved, ready-to-render previews for the 4 grid slots, same order. */
  assetPreviews: ProjectAssetItem[];
  /** Raw value from backend — may be empty string, since the admin edit form
   *  needs to distinguish "unset" from "explicitly /404". */
  href: string;
};

// `GET /api/projects/:id` returns the raw Mongoose document, which uses
// `_id` instead of `id`. Normalize defensively wherever a single project is
// fetched by id.
export type RawAdminProject = Omit<AdminProject, "id"> & {
  id?: string;
  _id?: string;
};

export type AdminUser = {
  _id: string;
  name: string;
  email: string;
  userType: "Admin" | "Moderator";
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectPayload = {
  title: string;
  description: string;
  /** Exactly 4 asset ids from prior `uploadAsset`/`replaceAsset` calls, in
   *  grid order: top-left, top-right, bottom-left, bottom-right. */
  assets: string[];
  section: ProjectSection;
  isPublished?: boolean;
  href?: string;
};

export type UpdateProjectPayload = Partial<
  CreateProjectPayload & { order: number }
>;

export type AssetMetadata = {
  originalName: string;
  mimeType: string;
  fileType: string;
  fileSize: number;
};

// ---------------------------------------------------------------------------
// Page sections (`/api/pages/...`)
//
// Deliberate asymmetry: the **public** read is strongly typed below so the
// Home section components can consume it directly, while the **admin** editor
// works against `Record<string, unknown>` (`AdminSectionDoc`). The editor is
// descriptor-driven, so typing it generically would fight `strict: true` for
// no payoff — the backend's zod schema is the real contract.
// ---------------------------------------------------------------------------

/**
 * THE standard admin-managed button — the same shape for every button in
 * every section, mirroring the backend's `controllers/shared/button.ts`.
 * Render one with `shared/ContentButton.tsx`; never destructure it into a
 * bespoke per-section button shape.
 *
 * `color` picks the component (`blue` => `ButtonBlue`, `white` =>
 * `ButtonWhite`). `contactCta` is the admin's "use as footer CTA" checkbox:
 * the button scrolls to the footer contact form instead of navigating, which
 * is why `href` may be empty for one.
 */
export type CmsButton = {
  text: string;
  color: "blue" | "white";
  href: string;
  contactCta: boolean;
};

/** One line of the hero headline; `highlight` renders in a darker span. */
export type HeroLine = {
  text: string;
  highlight?: string;
};

export type HeroContent = {
  headingLines: HeroLine[];
  topBar: { left: string; center: string; right: string };
  primaryCta: CmsButton;
  secondaryCta: CmsButton;
};

// Matches `projectsIntro` in `src/app/(Home)/data/projectsIntro.ts`, whose
// static keys predate the CMS and read `eyebrow`/`body`/`footnote` — mapped at
// the call site rather than renamed.
export type ProjectsIntroContent = {
  tagName: string;
  description: string;
  footer: string;
};

/** The sticky label beside a projects list — `projectsOneTag`/`projectsTwoTag`. */
export type ProjectsTagContent = {
  tagName: string;
};

// Matches `ApproachPillar` in `src/app/(Home)/data/approach.ts`.
export type WhyUsPoint = {
  title: string;
  description: string;
};

export type WhyUsContent = {
  tagName: string;
  mainText: string;
  points: WhyUsPoint[];
  buttons: CmsButton[];
};

// Matches `Capability` in `src/app/(Home)/data/capabilities.ts`
// field-for-field — same contract as `HomeProjectCard`.
export type CapabilityItem = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
};

export type CapabilitiesContent = {
  eyebrow: string;
  items: CapabilityItem[];
};

export type TestimonialMediaItem = {
  url: string;
  type: "image" | "video";
};

// Matches `Testimonial` in `src/app/(Home)/data/testimonials.ts`.
// On the public read, `avatar` is a resolved URL string (image-only), while
// `media` is `{ url, type }` since it may be an image or a video. On the
// admin read, both are asset ids instead (each with a sibling `<field>Url`,
// and `media` additionally with a `<field>Type` sibling).
export type TestimonialItem = {
  slug: string;
  quote: string;
  author: string;
  role: string;
  avatar: string;
  media: TestimonialMediaItem;
};

export type TestimonialsContent = {
  items: TestimonialItem[];
};

// Matches `designDna` in `src/app/(Home)/data/designPrinciples.ts`. The
// `principles` marquee stays static — deliberately not CMS-backed.
export type DesignDnaContent = {
  tagName: string;
  description: string;
  button: CmsButton;
};

/**
 * One article card. Matches `Article` in `(Home)/data/articles.ts`, except
 * `image` arrives as a resolved URL from the public read (the admin stores an
 * assetId) and `slug` is derived server-side — never typed by an admin.
 */
export type InsightArticle = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
};

export type InsightsContent = {
  tagName: string;
  button: CmsButton;
  items: InsightArticle[];
};

/**
 * Every key is optional: the public endpoint omits sections that are missing
 * or unpublished, and a missing key means "fall back to static" (rule 5).
 */
export type HomePageContent = Partial<{
  hero: HeroContent;
  projectsIntro: ProjectsIntroContent;
  projectsOneTag: ProjectsTagContent;
  whyUs: WhyUsContent;
  projectsTwoTag: ProjectsTagContent;
  capabilities: CapabilitiesContent;
  testimonials: TestimonialsContent;
  designDna: DesignDnaContent;
  insights: InsightsContent;
}>;

// Matches `EPage.Work`'s sole section (backend `pageSection/schemas/work.ts`)
// — the intro copy above the showcase-card grid on `/work-innovation`.
export type WorkHeaderContent = {
  description: string;
};

export type WorkPageContent = Partial<{
  header: WorkHeaderContent;
}>;

/**
 * Admin read of a single section. Never 404s for an unseeded section — the
 * backend answers with its registry defaults and `exists: false`.
 */
export type AdminSectionDoc = {
  page: string;
  section: string;
  exists: boolean;
  isPublished: boolean;
  /** Intentionally untyped — see the note at the top of this block. */
  content: Record<string, unknown>;
  updatedAt: string | null;
};

export type AdminSectionSummary = {
  section: string;
  label: string;
  exists: boolean;
  isPublished: boolean;
  updatedAt: string | null;
};

export type SectionUpsertPayload = {
  content: Record<string, unknown>;
  isPublished?: boolean;
};

export type AssetResponse = {
  assetId: string;
  url: string;
  mimeType: string;
  metadata: AssetMetadata;
};

// ---------------------------------------------------------------------------
// Case studies (`/api/case-studies/...`)
//
// A case study is a standalone CMS resource (own admin board, not tied 1:1 to
// `Project`) with exactly 8 fixed sections. Unlike `HomePageContent`, there is
// no prior static copy to fall back to, so `CaseStudySections` keys are
// simply absent when an admin hasn't saved that section yet — the public
// page guards each section by presence, not by a `pickText`/`pickList` merge.
// ---------------------------------------------------------------------------

export type CaseStudySection =
  | "hero"
  | "overview"
  | "showcase"
  | "gallery"
  | "quote"
  | "outcomes"
  | "testimonial";

export type AdminCaseStudy = {
  id: string;
  title: string;
  slug: string;
  order: number;
  isPublished: boolean;
  updatedAt: string;
};

// `POST /api/case-studies` and the admin list/get endpoints return the raw
// Mongoose document, which uses `_id` instead of `id` (and, for `POST`, also
// carries `content`/`createdAt`) — normalize defensively wherever a case
// study is fetched or created, mirroring `RawAdminProject`.
export type RawAdminCaseStudy = Omit<AdminCaseStudy, "id"> & {
  id?: string;
  _id?: string;
  content?: Record<string, unknown>;
  createdAt?: string;
};

export type UpdateCaseStudyPayload = Partial<{
  title: string;
  isPublished: boolean;
}>;

export type CaseStudySectionSummary = {
  section: CaseStudySection;
  label: string;
  exists: boolean;
};

/**
 * Admin read of a single case study section. Unlike `AdminSectionDoc`, there
 * is no `isPublished` here — the publish toggle lives only on the parent
 * `CaseStudy` document, not per-section.
 */
export type AdminCaseStudySectionDoc = {
  caseStudyId: string;
  section: string;
  exists: boolean;
  /** Intentionally untyped — same reasoning as `AdminSectionDoc.content`. */
  content: Record<string, unknown>;
};

export type CaseStudySectionUpsertPayload = {
  content: Record<string, unknown>;
};

export type CaseStudyAsset = {
  url: string;
  type: "image" | "video";
};

export type CaseStudyHeroContent = {
  category: string;
  title: string;
  aboutClient: string;
  year: string;
  duration: string;
  services: string[];
  heroAsset: CaseStudyAsset;
};

export type CaseStudyOverviewContent = {
  heading: string;
  description: string;
  points: string[];
};

export type CaseStudyShowcaseContent = {
  heading: string;
  description: string[];
  media: { asset: CaseStudyAsset }[];
};

export type CaseStudyGalleryContent = {
  images: { asset: { url: string } }[];
};

export type CaseStudyQuoteContent = {
  text: string;
};

export type CaseStudyOutcomePoint = {
  value: string;
  label: string;
};

export type CaseStudyOutcomesContent = {
  heading: string;
  /** Min 3 enforced server-side on save. */
  points: CaseStudyOutcomePoint[];
};

export type CaseStudyTestimonialContent = {
  quote: string;
  author: string;
  role: string;
};

/**
 * Every key is optional: a case study has no prior static copy, so a section
 * an admin has never saved is simply absent from `sections` — the page
 * guards each one by presence.
 */
export type CaseStudySections = Partial<{
  hero: CaseStudyHeroContent;
  overview: CaseStudyOverviewContent;
  showcase: CaseStudyShowcaseContent;
  gallery: CaseStudyGalleryContent;
  quote: CaseStudyQuoteContent;
  outcomes: CaseStudyOutcomesContent;
  testimonial: CaseStudyTestimonialContent;
}>;

export type PublicCaseStudy = {
  slug: string;
  title: string;
  sections: CaseStudySections;
  /**
   * Computed server-side from the published, order-sorted case-study list
   * (wraps last -> first / first -> last; a single published case study
   * points to itself). `null` only in a should-never-happen edge case.
   */
  nextCaseStudy: { title: string; slug: string } | null;
  previousCaseStudy: { title: string; slug: string } | null;
};

/**
 * Published-only summary; powers `generateStaticParams` for `/work/[slug]`.
 * The backend nests the resolved Hero content (for card thumbnails) under
 * `hero` rather than flattening it — `hero` is itself optional since a
 * published case study could in principle still be missing its Hero section.
 */
export type PublicCaseStudySummary = {
  slug: string;
  title: string;
  hero?: CaseStudyHeroContent;
};

// ---------------------------------------------------------------------------
// Showcase cards (`/api/showcase-cards/...`) — "Work & Innovation" module.
//
// A standalone content type: its own admin board with a single global order
// (like case studies, unlike Projects' two-section split). `href` is a
// manually-typed string that *might* point at a `/work/[slug]` page but has
// no code-level relationship to `CaseStudy` — this resource never fetches
// from or depends on the case-study API at runtime.
// ---------------------------------------------------------------------------

export type Sector = "saas" | "b2b" | "ecommerce" | "fintech";

export type ShowcaseCardAsset = {
  url: string;
  type: "image" | "video";
};

export type PublicShowcaseCard = {
  id: string;
  title: string;
  description: string;
  asset: ShowcaseCardAsset;
  sector: Sector;
  tags: string[];
  readingTime: string;
  /** Always resolved server-side, never empty — backend defaults it to `/404` if unset. */
  href: string;
  /** When true, the card also appears in the hero carousel. */
  highlight: boolean;
  /** UI-only: spans more of the `grid-auto-flow: dense` grid. */
  isBigCard: boolean;
};

// Shape returned by `GET /api/showcase-cards` (admin list) — uses `id`.
export type AdminShowcaseCard = {
  id: string;
  title: string;
  description: string;
  /** Raw asset id — never a resolved URL. */
  asset: string;
  /** Resolved, ready-to-render preview for the asset slot. */
  assetPreview: ShowcaseCardAsset;
  sector: Sector;
  tags: string[];
  readingTime: string;
  href: string;
  highlight: boolean;
  isBigCard: boolean;
  order: number;
  isPublished: boolean;
};

// `GET /api/showcase-cards/:id` (and create) returns the raw Mongoose
// document, which uses `_id` instead of `id`. Normalize defensively wherever
// a single card is fetched or created (mirrors `RawAdminProject`).
export type RawAdminShowcaseCard = Omit<AdminShowcaseCard, "id"> & {
  id?: string;
  _id?: string;
};

export type CreateShowcaseCardPayload = {
  title: string;
  description: string;
  asset: string;
  sector: Sector;
  tags: string[];
  readingTime?: string;
  href?: string;
  highlight?: boolean;
  isBigCard?: boolean;
  isPublished?: boolean;
};

export type UpdateShowcaseCardPayload = Partial<CreateShowcaseCardPayload>;

// ---------------------------------------------------------------------------
// Sectors (`/api/sectors/...`)
//
// Structurally a twin of Case Studies (own admin board, own fixed set of
// sections, each separately fetched/saved via `PUT /sections/:section`) with
// two differences: the parent document carries a mandatory `backgroundAsset`
// (case studies have none), and there are 10 fixed sections instead of 7.
// NOTE: `AdminSector`/`PublicSector`/etc. are deliberately not named bare
// `Sector` — that identifier is already taken above by the unrelated
// ShowcaseCard sector-filter enum ("saas"|"b2b"|"ecommerce"|"fintech").
// ---------------------------------------------------------------------------

export type SectorSection =
  | "overview"
  | "metrics"
  | "projects"
  | "whyUs"
  | "specialized"
  | "industryExperts"
  | "services"
  | "capabilities"
  | "testimonials"
  | "closing";

export type SectorAsset = {
  url: string;
  type: "image" | "video";
};

export type AdminSector = {
  id: string;
  /** Admin label + slug source. Set at creation, never editable after. */
  name: string;
  /** Editable Hero heading — one entry per rendered line. */
  heroTitle: string[];
  slug: string;
  /** Raw asset id — never a resolved URL. */
  backgroundAsset: string;
  /** Resolved, ready-to-render preview for the background asset. */
  backgroundAssetPreview: SectorAsset;
  order: number;
  isPublished: boolean;
  updatedAt: string;
};

// `POST /api/sectors` and the admin list/get endpoints return the raw
// Mongoose document, which uses `_id` instead of `id` (and, for `POST`, also
// carries `content`/`createdAt`) — normalize defensively wherever a sector is
// fetched or created, mirroring `RawAdminCaseStudy`.
export type RawAdminSector = Omit<AdminSector, "id"> & {
  id?: string;
  _id?: string;
  content?: Record<string, unknown>;
  createdAt?: string;
};

export type CreateSectorPayload = {
  /** Slug source + admin label. Immutable once created. */
  name: string;
  /** Hero heading lines; the backend defaults this to `[name]` if omitted. */
  heroTitle?: string[];
  /** Asset id from a prior `uploadAsset` call — never a raw URL. */
  backgroundAsset: string;
};

/**
 * No `name`/`slug` here by design — the backend rejects both, since `slug` is
 * derived from `name` at creation and letting the label drift would leave the
 * URL permanently disagreeing with it. Editable display copy is `heroTitle`.
 */
export type UpdateSectorPayload = Partial<{
  heroTitle: string[];
  backgroundAsset: string;
  isPublished: boolean;
}>;

export type SectorSectionSummary = {
  section: SectorSection;
  label: string;
  exists: boolean;
};

/**
 * Admin read of a single sector section. Unlike `AdminSectionDoc`, there is
 * no `isPublished` here — the publish toggle lives only on the parent
 * `Sector` document, not per-section (mirrors `AdminCaseStudySectionDoc`).
 */
export type AdminSectorSectionDoc = {
  sectorId: string;
  section: string;
  exists: boolean;
  /** Intentionally untyped — same reasoning as `AdminSectionDoc.content`. */
  content: Record<string, unknown>;
};

export type SectorSectionUpsertPayload = {
  content: Record<string, unknown>;
};

/**
 * Published-only summary; powers `generateStaticParams` for `/sectors/[slug]`.
 * No `id` — the backend's `getPublicSectors` deliberately returns only
 * `slug`/`name`/`backgroundAsset`, mirroring `getPublicCaseStudies`.
 */
export type PublicSector = {
  /** Label (slug source), not display copy — see `heroTitle` for the heading. */
  name: string;
  /** One entry per rendered Hero heading line. */
  heroTitle: string[];
  slug: string;
  backgroundAsset: SectorAsset;
};

// --- Per-section public content, typed for `/sectors/[slug]` -------------
// Every asset field below resolves to `SectorAsset` ({url,type}) on the
// public read — the backend applies "replaceWithType" uniformly across every
// asset path in a section (mirrors `CaseStudy`'s public detail read; see
// `getPublicSectorBySlug`), never the bare-string "replace" mode `PageSection`
// uses for `TestimonialItem.avatar`. Components that only need the URL (e.g.
// `TestimonialsCarousel`, which expects a bare string) read `.url` at the
// call site rather than this type changing shape.

export type SectorOverviewContent = {
  about: string;
  domainExpertName: string;
  domainExpertDescription: string;
  domainExpertLinkedIn: string;
  domainExpertImage: SectorAsset;
};

export type SectorMetric = { metric: string; value: string };
export type SectorMetricsContent = { metrics: SectorMetric[] };

export type SectorProject = {
  projectName: string;
  asset: SectorAsset;
  /** Empty string resolved to "/404" server-side already — never empty here. */
  href: string;
};
export type SectorProjectsContent = {
  projectsTagName: string;
  projects: SectorProject[];
};

export type SectorWhyUsPoint = { title: string; description: string };
export type SectorWhyUsContent = {
  whyUsTagName: string;
  heading: string;
  points: SectorWhyUsPoint[];
};

export type SectorSpecializedItem = {
  title: string;
  description: string;
  bulletPoints: string[];
};
export type SectorSpecializedContent = {
  specializedTagName: string;
  specialized: SectorSpecializedItem[];
};

export type SectorProfile = {
  name: string;
  designation: string;
  expertise: string;
  linkedIn: string;
  profileImage: SectorAsset;
};
export type SectorIndustryExpertsContent = {
  industryExpertsTagName: string;
  profiles: SectorProfile[];
};

export type SectorService = {
  imageAsset: SectorAsset;
  title: string;
  description: string;
};
export type SectorServicesContent = {
  servicesTagName: string;
  services: SectorService[];
};

export type SectorCapabilityOption = { title: string; description: string };
export type SectorCapabilitiesContent = {
  capabilitiesTagName: string;
  heading: string;
  options: SectorCapabilityOption[];
};

/** Slug is server-derived (`deriveSlugs`), never admin-typed. */
export type SectorTestimonialItem = {
  slug: string;
  quote: string;
  author: string;
  role: string;
  avatar: SectorAsset;
  media: SectorAsset;
};
export type SectorTestimonialsContent = { items: SectorTestimonialItem[] };

export type SectorFaqItem = { title: string; description: string };
export type SectorClosingContent = { foundersSay: string; faq: SectorFaqItem[] };

/**
 * Every key is optional: a sector has no prior static copy, so a section an
 * admin has never saved is simply absent — the page guards each one by
 * presence, same contract as `CaseStudySections`.
 */
export type SectorSections = Partial<{
  overview: SectorOverviewContent;
  metrics: SectorMetricsContent;
  projects: SectorProjectsContent;
  whyUs: SectorWhyUsContent;
  specialized: SectorSpecializedContent;
  industryExperts: SectorIndustryExpertsContent;
  services: SectorServicesContent;
  capabilities: SectorCapabilitiesContent;
  testimonials: SectorTestimonialsContent;
  closing: SectorClosingContent;
}>;

export type PublicSectorDetail = {
  /** Label (slug source) — used for metadata/running text, not the Hero. */
  name: string;
  /** One entry per rendered Hero heading line. */
  heroTitle: string[];
  slug: string;
  backgroundAsset: SectorAsset;
  sections: SectorSections;
  /** Derived server-side (published/order-sorted wrap-around), never stored. */
  nextSector: { name: string; href: string } | null;
};

// ---------------------------------------------------------------------------
// Navigation (`/api/navigation/...`)
//
// A true singleton — there is only ever one Navigation document, unlike
// Sectors (a board of many) or Home's PageSections (many page×section
// pairs). Structurally it still borrows Sector's per-section shape (a fixed
// set of named sections, each separately fetched/saved via
// `PUT /sections/:section`), just with no parent id in the URL at all.
// ---------------------------------------------------------------------------

export type NavigationSection =
  | "topBarLinks"
  | "menuLinks"
  | "sectorsDropdown"
  | "servicesDropdown"
  | "socialLinks";

export type NavigationSectionSummary = {
  section: NavigationSection;
  label: string;
  exists: boolean;
};

/** Admin read of a single Navigation section — no `isPublished`, same as `AdminSectorSectionDoc`. */
export type AdminNavigationSectionDoc = {
  section: string;
  exists: boolean;
  /** Intentionally untyped — same reasoning as `AdminSectionDoc.content`. */
  content: Record<string, unknown>;
};

export type NavigationSectionUpsertPayload = {
  content: Record<string, unknown>;
};

// --- Per-section public content, typed for the header/menu overlay/footer --

export type NavigationLinkItem = { label: string; href: string };

export type TopBarLinksContent = { items: NavigationLinkItem[] };
export type MenuLinksContent = { items: NavigationLinkItem[] };
export type SocialLinksContent = { items: NavigationLinkItem[] };

export type SectorsDropdownItem = {
  label: string;
  /** Resolved to a bare URL (`"replace"` mode) — always an image, never a video. */
  image: string;
  /** Empty string resolved to "/404" server-side already — never empty here. */
  href: string;
};
export type SectorsDropdownContent = { items: SectorsDropdownItem[] };

export type ServicesDropdownItem = {
  title: string;
  description: string;
  /** Resolved to a bare URL (`"replace"` mode) — always an image, never a video. */
  image: string;
  /** Empty string resolved to "/404" server-side already — never empty here. */
  href: string;
};
export type ServicesDropdownContent = { items: ServicesDropdownItem[] };

/**
 * Every key is optional: an unsaved section is simply absent, and callers
 * (`layout.tsx`, `Footer.tsx`) fall back per-field to static copy via
 * `pickList`, same contract as `HomePageContent`.
 */
export type NavigationPublicContent = Partial<{
  topBarLinks: TopBarLinksContent;
  menuLinks: MenuLinksContent;
  sectorsDropdown: SectorsDropdownContent;
  servicesDropdown: ServicesDropdownContent;
  socialLinks: SocialLinksContent;
}>;

// ---------------------------------------------------------------------------
// About Us (`/api/about-us/...`)
//
// A true singleton, same contract as Navigation — one document ever exists,
// no `:id` in any route, no doc-level publish toggle. 7 fixed sections
// instead of Navigation's 4. Every asset field resolves to `AboutUsAsset`
// (`{url,type}`) on the public read, same uniform-resolution contract as
// `SectorAsset`.
// ---------------------------------------------------------------------------

export type AboutUsSection =
  | "hero"
  | "stats"
  | "companyHighlight"
  | "whatWeServe"
  | "process"
  | "solutions"
  | "team";

export type AboutUsAsset = { url: string; type: "image" | "video" };

export type AboutUsSectionSummary = {
  section: AboutUsSection;
  label: string;
  exists: boolean;
};

/** Admin read of a single About Us section — no `isPublished`, same as `AdminNavigationSectionDoc`. */
export type AdminAboutUsSectionDoc = {
  section: string;
  exists: boolean;
  /** Intentionally untyped — same reasoning as `AdminSectionDoc.content`. */
  content: Record<string, unknown>;
};

export type AboutUsSectionUpsertPayload = {
  content: Record<string, unknown>;
};

// --- Per-section public content, typed for `/about` -----------------------

export type AboutUsHeroLine = { text: string; highlight?: string };
export type AboutUsHeroContent = { headingLines: AboutUsHeroLine[] };

export type AboutUsStat = { value: string; label: string };
export type AboutUsStatsContent = { stats: AboutUsStat[] };

export type AboutUsCompanyHighlightContent = {
  heading: string;
  descriptions: string[];
};

export type AboutUsServeItem = { title: string; description: string };
export type AboutUsWhatWeServeContent = {
  tagName: string;
  description: string;
  items: AboutUsServeItem[];
};

export type AboutUsProcessStep = { title: string; description: string };
export type AboutUsProcessContent = { heading: string; steps: AboutUsProcessStep[] };

export type AboutUsSolutionItem = {
  title: string;
  description: string;
  asset: AboutUsAsset;
};
export type AboutUsSolutionsContent = {
  tagName: string;
  items: AboutUsSolutionItem[];
};

export type AboutUsTeamMember = {
  profileImage: AboutUsAsset;
  name: string;
  designation: string;
  linkedIn: string;
};
export type AboutUsTeamContent = { tagName: string; members: AboutUsTeamMember[] };

/**
 * Every key is optional: an unsaved section is simply absent, and there is no
 * prior static copy to fall back to (this is a brand-new page) — the public
 * page guards each section by presence, same contract as `CaseStudySections`.
 */
export type AboutUsSections = Partial<{
  hero: AboutUsHeroContent;
  stats: AboutUsStatsContent;
  companyHighlight: AboutUsCompanyHighlightContent;
  whatWeServe: AboutUsWhatWeServeContent;
  process: AboutUsProcessContent;
  solutions: AboutUsSolutionsContent;
  team: AboutUsTeamContent;
}>;

export type PublicAboutUs = { sections: AboutUsSections };

// ---------------------------------------------------------------------------
// Services (`/api/services/...`)
//
// Structurally a twin of Sectors (own admin board, own fixed set of
// sections, each separately fetched/saved via `PUT /sections/:section`), with
// two differences: only 7 sections instead of 10, and no separate top-level
// `heroTitle` field/form — all Hero content (including the heading lines)
// lives inside the `hero` section itself, edited only through the normal
// section editor.
// ---------------------------------------------------------------------------

export type ServiceSection =
  | "hero"
  | "stats"
  | "capabilities"
  | "process"
  | "caseStudies"
  | "clientsSay"
  | "faq";

export type ServiceAsset = {
  url: string;
  type: "image" | "video";
};

export type AdminService = {
  id: string;
  /** Admin label + slug source. Set at creation, never editable after. */
  name: string;
  slug: string;
  /** Raw asset id — never a resolved URL. */
  backgroundAsset: string;
  /** Resolved, ready-to-render preview for the background asset. */
  backgroundAssetPreview: ServiceAsset;
  order: number;
  isPublished: boolean;
  updatedAt: string;
};

// `POST /api/services` and the admin list/get endpoints return the raw
// Mongoose document, which uses `_id` instead of `id` (and, for `POST`, also
// carries `content`/`createdAt`) — normalize defensively wherever a service is
// fetched or created, mirroring `RawAdminSector`.
export type RawAdminService = Omit<AdminService, "id"> & {
  id?: string;
  _id?: string;
  content?: Record<string, unknown>;
  createdAt?: string;
};

export type CreateServicePayload = {
  /** Slug source + admin label. Immutable once created. */
  name: string;
  /** Asset id from a prior `uploadAsset` call — never a raw URL. */
  backgroundAsset: string;
};

/**
 * No `name`/`slug` here by design — the backend rejects both, since `slug` is
 * derived from `name` at creation and letting the label drift would leave the
 * URL permanently disagreeing with it. Unlike `UpdateSectorPayload` there is
 * no `heroTitle` here either — the Hero heading lives inside the `hero`
 * section and is edited only through the normal section editor.
 */
export type UpdateServicePayload = Partial<{
  backgroundAsset: string;
  isPublished: boolean;
}>;

export type ServiceSectionSummary = {
  section: ServiceSection;
  label: string;
  exists: boolean;
};

/**
 * Admin read of a single service section. No `isPublished` here — the
 * publish toggle lives only on the parent `Service` document, not
 * per-section (mirrors `AdminSectorSectionDoc`).
 */
export type AdminServiceSectionDoc = {
  serviceId: string;
  section: string;
  exists: boolean;
  /** Intentionally untyped — same reasoning as `AdminSectionDoc.content`. */
  content: Record<string, unknown>;
};

export type ServiceSectionUpsertPayload = {
  content: Record<string, unknown>;
};

/**
 * Published-only summary; powers `generateStaticParams` for `/services/[slug]`.
 * No `id` — mirrors `PublicSector`.
 */
export type PublicService = {
  /** Label (slug source), not display copy — the Hero heading lives in `hero.headingLines`. */
  name: string;
  slug: string;
  backgroundAsset: ServiceAsset;
};

// --- Per-section public content, typed for `/services/[slug]` -------------
// Every asset field below resolves to `ServiceAsset` ({url,type}) on the
// public read — same uniform-resolution contract as `SectorAsset`.

export type ServiceHeroHeadingLine = { text: string; highlight?: string };
export type ServiceHeroContent = {
  headingLines: ServiceHeroHeadingLine[];
  description: string;
  /** Image or video. */
  asset: ServiceAsset;
};

export type ServiceStat = { key: string; value: string };
export type ServiceStatsContent = { stats: ServiceStat[] };

export type ServiceCapability = {
  title: string;
  description: string;
  /** Image only. */
  asset: ServiceAsset;
};
export type ServiceCapabilitiesContent = {
  tagName: string;
  capabilities: ServiceCapability[];
};

export type ServiceProcessStep = { title: string; description: string };
export type ServiceProcessContent = { heading: string; steps: ServiceProcessStep[] };

export type ServiceCaseStudyItem = {
  /** Image only. */
  asset: ServiceAsset;
  title: string;
  description: string;
  /** Empty string resolved to "/404" server-side already — never empty here. */
  href: string;
};
export type ServiceCaseStudiesContent = {
  tagName: string;
  caseStudies: ServiceCaseStudyItem[];
};

/**
 * Single object, not a list — the only non-array Service section. Rendered
 * as one static quote block, no carousel, no avatar/media.
 */
export type ServiceClientsSayContent = {
  quote: string;
  quoteBy: string;
  designation: string;
};

export type ServiceFaqItem = { title: string; description: string };
export type ServiceFaqContent = { faq: ServiceFaqItem[] };

/**
 * Every key is optional: a service has no prior static copy, so a section an
 * admin has never saved is simply absent — the page guards each one by
 * presence, same contract as `SectorSections`.
 */
export type ServiceSections = Partial<{
  hero: ServiceHeroContent;
  stats: ServiceStatsContent;
  capabilities: ServiceCapabilitiesContent;
  process: ServiceProcessContent;
  caseStudies: ServiceCaseStudiesContent;
  clientsSay: ServiceClientsSayContent;
  faq: ServiceFaqContent;
}>;

export type PublicServiceDetail = {
  name: string;
  slug: string;
  backgroundAsset: ServiceAsset;
  sections: ServiceSections;
  /** Derived server-side (published/order-sorted wrap-around), never stored. */
  nextService: { name: string; href: string } | null;
};

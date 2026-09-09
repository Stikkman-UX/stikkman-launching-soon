import type {
  NavigationLinkItem,
  SectorsDropdownItem,
  ServicesDropdownItem,
} from "@/lib/api/types";
import { CONTACT_HREF } from "@/lib/contactCta";
import { COMING_SOON_HREF } from "@/lib/comingSoon";

/**
 * Static copy lifted out of `Header.tsx`/`MenuOverlay.tsx`/`Footer.tsx`,
 * used per-field via `pickList` (Rule 5: keep working if the CMS/backend is
 * unavailable or a section was never saved). Duplicates the backend's
 * `NAVIGATION_SECTION_REGISTRY` defaults' shape on purpose — neither app may
 * depend on the other.
 *
 * This site only ships the Home page, so every destination that isn't built
 * here points at `COMING_SOON_HREF` instead of a dead `#` or a 404 route.
 */

export const topBarLinksFallback: NavigationLinkItem[] = [
  { label: "Work & innovation", href: COMING_SOON_HREF },
  { label: "Stikkman AI", href: COMING_SOON_HREF },
];

export const menuLinksFallback: NavigationLinkItem[] = [
  { label: "Work & Innovation", href: COMING_SOON_HREF },
  { label: "Services", href: COMING_SOON_HREF },
  { label: "Studio", href: COMING_SOON_HREF },
  { label: "Stikkman AI", href: COMING_SOON_HREF },
  { label: "Careers", href: COMING_SOON_HREF },
  // The contact form exists on this site, so this one has a real destination.
  { label: "Contact", href: CONTACT_HREF },
];

// Every entry currently points at the same placeholder image — swap in real
// per-sector photography here once it's available, the hover/focus swap
// logic in `MenuOverlay` is already wired to whatever `image` each entry has.
export const sectorsDropdownFallback: SectorsDropdownItem[] = [
  { label: "Fintech Insurance", image: "/landing/project/image-1.png", href: COMING_SOON_HREF },
  { label: "Healthcare Pharma", image: "/landing/project/image-1.png", href: COMING_SOON_HREF },
  { label: "SaaS", image: "/landing/project/image-1.png", href: COMING_SOON_HREF },
  { label: "ECommerce", image: "/landing/project/image-1.png", href: COMING_SOON_HREF },
  { label: "Digital Experience", image: "/landing/project/image-1.png", href: COMING_SOON_HREF },
  { label: "AI", image: "/landing/project/image-1.png", href: COMING_SOON_HREF },
];

// Every entry currently points at the same placeholder image — swap in real
// per-service photography here once it's available, same treatment as
// `sectorsDropdownFallback`.
export const servicesDropdownFallback: ServicesDropdownItem[] = [
  {
    title: "Product Experience Transformation",
    description: "Turn complex products into intuitive, scalable experiences.",
    image: "/landing/project/image-1.png",
    href: COMING_SOON_HREF,
  },
  {
    title: "Design Systems & Scale",
    description: "One language, learned once — so every team builds in tune.",
    image: "/landing/project/image-1.png",
    href: COMING_SOON_HREF,
  },
  {
    title: "Research & UX Strategy",
    description:
      "Evidence before opinion — a point of view you can build on.",
    image: "/landing/project/image-1.png",
    href: COMING_SOON_HREF,
  },
  {
    title: "Service & Journey Design",
    description: "Design the whole journey, not just the screens.",
    image: "/landing/project/image-1.png",
    href: COMING_SOON_HREF,
  },
  {
    title: "Brand & Experience Design",
    description: "A brand that feels the same everywhere it lives.",
    image: "/landing/project/image-1.png",
    href: COMING_SOON_HREF,
  },
  {
    title: "Growth & Conversion",
    description: "Win the numbers by refusing to add friction.",
    image: "/landing/project/image-1.png",
    href: COMING_SOON_HREF,
  },
];

export const socialLinksFallback: NavigationLinkItem[] = [
  { label: "Instagram", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "Are.na", href: "#" },
  { label: "Read.cv", href: "#" },
];

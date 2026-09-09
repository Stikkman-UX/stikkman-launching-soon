"use client";

import { useState } from "react";
import type {
  NavigationLinkItem,
  SectorsDropdownItem,
  ServicesDropdownItem,
} from "@/lib/api/types";
import Container from "./Container";

const info: {
  label: string;
  value?: string;
  href?: string;
  dot?: boolean;
  /** Rendered from `socialLinks` instead of a single static `value`. */
  social?: true;
  /** Right-aligns this cell within the info grid. */
  right?: true;
}[] = [
  {
    label: "Enquiries",
    value: "hello@stikkmanux.com",
    href: "mailto:hello@stikkmanux.com",
  },
  { label: "We Work", value: "Cinnabar Hills, Embassy Golf Links Business Park." },
  { label: "Social", social: true },
  { label: "Status", value: "Booking Q3 2026", dot: true, right: true },
];

export default function MenuOverlay({
  menuLinks,
  sectorsDropdown,
  servicesDropdown,
  socialLinks,
  onNavigate,
}: {
  menuLinks: NavigationLinkItem[];
  sectorsDropdown: SectorsDropdownItem[];
  servicesDropdown: ServicesDropdownItem[];
  socialLinks: NavigationLinkItem[];
  onNavigate?: () => void;
}) {
  // Defaults to the first sector and only ever moves forward on
  // hover/focus — never reset on leave, so whichever sector was last
  // visited stays selected once the pointer moves away.
  const [activeSector, setActiveSector] = useState(0);
  const [sectorsExpanded, setSectorsExpanded] = useState(false);
  const [servicesExpanded, setServicesExpanded] = useState(false);

  // Desktop/tablet: "Services" has no side-card treatment (unlike Sectors),
  // so it becomes the same inline accordion there too — swapped in for the
  // plain "Services" link at its existing position rather than inserted
  // alongside it.
  const desktopNavEntries: (
    | { kind: "link"; link: NavigationLinkItem }
    | { kind: "services" }
  )[] = menuLinks.map((link, i) => (i === 1 ? { kind: "services" } : { kind: "link", link }));

  // Below `lg` there's no room for the side-by-side image card, so
  // "Sectors" (and, right after it, "Services") is inlined into the link
  // list as its own accordion entry instead — positioned right after the
  // 2nd link to match the design.
  const mobileNavEntries: (
    | { kind: "link"; link: NavigationLinkItem }
    | { kind: "sectors" }
    | { kind: "services" }
  )[] = menuLinks.reduce<
    (
      | { kind: "link"; link: NavigationLinkItem }
      | { kind: "sectors" }
      | { kind: "services" }
    )[]
  >((entries, link, i) => {
    entries.push({ kind: "link", link });
    if (i === 1) {
      entries.push({ kind: "sectors" });
      entries.push({ kind: "services" });
    }
    return entries;
  }, []);

  return (
    <div
      data-lenis-prevent
      className="no-scrollbar flex h-full flex-col gap-14 justify-between overflow-y-auto py-14 lg:pt-14 lg:pb-20 "
    >
      <Container className="flex flex-1 flex-col justify-center gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-10 lg:pl-10 lg:pr-17 ">
        <nav
          aria-label="Main menu"
          className="flex h-full flex-1 flex-col lg:self-stretch"
        >
          {/* Desktop/tablet (lg+): the numbered link list — "Services" is
              swapped for the same inline accordion as the mobile list below
              (Sectors keeps its dedicated side card instead). Fixed `gap-8`
              rather than `justify-between` for the same reason as the mobile
              list's fixed gap: spread spacing would get re-divided the
              moment the accordion grows, shifting every other link. */}
          <ol className="hidden h-full flex-1 flex-col gap-8 lg:flex">
            {desktopNavEntries.map((entry, i) =>
              entry.kind === "link" ? (
                <li
                  key={entry.link.label}
                  className="flex items-baseline gap-3 lg:gap-6"
                >
                  <span className="w-5 shrink-0 font-mono text-xs text-white/30">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <a
                    href={entry.link.href}
                    onClick={onNavigate}
                    className="text-2xl leading-tight text-white/60 transition-colors hover:text-white sm:text-3xl lg:text-[32px] xl:leading-10 tracking-[-0.8px] "
                  >
                    {entry.link.label}
                  </a>
                </li>
              ) : (
                <li key="services" className="flex flex-col">
                  <div className="flex items-baseline gap-3 lg:gap-6">
                    <span className="w-5 shrink-0 font-mono text-xs text-white/30">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      onClick={() => setServicesExpanded((open) => !open)}
                      aria-expanded={servicesExpanded}
                      className={`flex items-center gap-2 text-2xl leading-tight transition-colors hover:text-white sm:text-3xl lg:text-[32px] xl:leading-10 tracking-[-0.8px] ${
                        servicesExpanded ? "text-white" : "text-white/60"
                      }`}
                    >
                      Services
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                          servicesExpanded ? "rotate-180" : ""
                        }`}
                      >
                        <path
                          d="M6 9l6 6 6-6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>

                  <div
                    aria-hidden={!servicesExpanded}
                    className={`ml-8 grid overflow-hidden transition-[grid-template-rows,margin-top] duration-300 ease-in-out ${
                      servicesExpanded
                        ? "mt-3 grid-rows-[1fr]"
                        : "mt-0 grid-rows-[0fr]"
                    }`}
                  >
                    <ul className="flex min-h-0 flex-col gap-2">
                      {servicesDropdown.map((service) => (
                        <li key={service.title}>
                          <a
                            href={service.href}
                            onClick={onNavigate}
                            tabIndex={servicesExpanded ? 0 : -1}
                            className="block text-sm leading-6 text-white/50 transition-colors hover:text-white"
                          >
                            {service.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ),
            )}
          </ol>

          {/* Mobile (< lg): same links, with "Sectors" inlined as an
              accordion instead of the side image card. The 28px gap is
              fixed rather than distributed via `justify-between` — spread
              spacing would get re-divided the moment the accordion grows,
              shifting every other link. */}
          <ol className="flex flex-1 flex-col gap-10 lg:hidden">
            {mobileNavEntries.map((entry, i) =>
              entry.kind === "link" ? (
                <li
                  key={entry.link.label}
                  className="flex items-baseline gap-3"
                >
                  <span className="w-5 shrink-0 font-mono text-xs text-white/30">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <a
                    href={entry.link.href}
                    onClick={onNavigate}
                    className="text-2xl leading-tight text-white/60 transition-colors hover:text-white sm:text-3xl tracking-[-0.8px] "
                  >
                    {entry.link.label}
                  </a>
                </li>
              ) : entry.kind === "sectors" ? (
                <li key="sectors" className="flex flex-col">
                  <div className="flex items-baseline gap-3">
                    <span className="w-5 shrink-0 font-mono text-xs text-white/30">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSectorsExpanded((open) => !open)}
                      aria-expanded={sectorsExpanded}
                      className={`flex items-center gap-2 text-2xl leading-tight transition-colors hover:text-white sm:text-3xl tracking-[-0.8px] ${
                        sectorsExpanded ? "text-white" : "text-white/60"
                      }`}
                    >
                      Sectors
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                          sectorsExpanded ? "rotate-180" : ""
                        }`}
                      >
                        <path
                          d="M6 9l6 6 6-6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Always mounted so the height transition can animate
                      in both directions — the `grid-template-rows`
                      0fr/1fr trick smoothly grows/shrinks to fit content
                      of an unknown height without a hardcoded max-height. */}
                  <div
                    aria-hidden={!sectorsExpanded}
                    className={`ml-8 grid overflow-hidden transition-[grid-template-rows,margin-top] duration-300 ease-in-out ${
                      sectorsExpanded
                        ? "mt-3 grid-rows-[1fr]"
                        : "mt-0 grid-rows-[0fr]"
                    }`}
                  >
                    <ul className="flex min-h-0 flex-col gap-2">
                      {sectorsDropdown.map((sector) => (
                        <li key={sector.label}>
                          <a
                            href={sector.href}
                            onClick={onNavigate}
                            tabIndex={sectorsExpanded ? 0 : -1}
                            className="block text-sm leading-6 text-white/50 transition-colors hover:text-white"
                          >
                            {sector.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ) : (
                <li key="services" className="flex flex-col">
                  <div className="flex items-baseline gap-3">
                    <span className="w-5 shrink-0 font-mono text-xs text-white/30">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      onClick={() => setServicesExpanded((open) => !open)}
                      aria-expanded={servicesExpanded}
                      className={`flex items-center gap-2 text-2xl leading-tight transition-colors hover:text-white sm:text-3xl tracking-[-0.8px] ${
                        servicesExpanded ? "text-white" : "text-white/60"
                      }`}
                    >
                      Services
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
                          servicesExpanded ? "rotate-180" : ""
                        }`}
                      >
                        <path
                          d="M6 9l6 6 6-6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>

                  <div
                    aria-hidden={!servicesExpanded}
                    className={`ml-8 grid overflow-hidden transition-[grid-template-rows,margin-top] duration-300 ease-in-out ${
                      servicesExpanded
                        ? "mt-3 grid-rows-[1fr]"
                        : "mt-0 grid-rows-[0fr]"
                    }`}
                  >
                    <ul className="flex min-h-0 flex-col gap-3">
                      {servicesDropdown.map((service) => (
                        <li key={service.title}>
                          <a
                            href={service.href}
                            onClick={onNavigate}
                            tabIndex={servicesExpanded ? 0 : -1}
                            className="block text-sm leading-6 text-white/50 transition-colors hover:text-white"
                          >
                            {service.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ),
            )}
          </ol>
        </nav>

        <div className="hidden w-full max-w-[500px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 lg:block lg:w-[500px]">
          <a
            href={sectorsDropdown[activeSector]?.href ?? "#"}
            onClick={onNavigate}
            className="relative block aspect-[378/152] w-full overflow-hidden bg-black/40 lg:h-[200px]"
          >
            {sectorsDropdown.map((sector, i) => (
              <img
                key={sector.label}
                src={sector.image}
                alt={sector.label}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                  i === activeSector ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </a>

          <div className="p-6 ">
            <p className="mb-4 font-mono text-[10px] tracking-[1.72px] leading-4 text-white/40 uppercase">
              Sectors
            </p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
              {sectorsDropdown.map((sector, i) => (
                <li key={sector.label}>
                  {/* Navigates on click just like the preview image above
                      it; hover/focus still only swaps which sector that
                      image is showing. */}
                  <a
                    href={sector.href}
                    onMouseEnter={() => setActiveSector(i)}
                    onFocus={() => setActiveSector(i)}
                    onClick={onNavigate}
                    className={`block text-left text-sm leading-6 transition-colors ${
                      i === activeSector
                        ? "text-white"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {sector.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      <Container>
        <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8 sm:grid-cols-4">
          {info.map((item) => (
            <div
              key={item.label}
              className={item.right ? "text-right sm:justify-self-end" : undefined}
            >
              <p className="font-mono text-xs tracking-widest text-white/40 uppercase">
                {item.label}
              </p>
              {item.social ? (
                <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/60">
                  {socialLinks.map((link, i) => (
                    <span key={link.label} className="flex items-center gap-2">
                      <a
                        href={link.href}
                        className="transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                      {i !== socialLinks.length - 1 && (
                        <span className="text-white/30">·</span>
                      )}
                    </span>
                  ))}
                </p>
              ) : item.href ? (
                <a
                  href={item.href}
                  className="mt-3 block text-sm text-white/60 transition-colors hover:text-white"
                >
                  {item.value}
                </a>
              ) : (
                <p
                  className={`mt-3 flex items-center gap-2 text-sm text-white/60 ${
                    item.right ? "justify-end" : ""
                  }`}
                >
                  {item.dot && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  )}
                  {item.value}
                </p>
              )}
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}

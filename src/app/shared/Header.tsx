"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import type {
  NavigationLinkItem,
  SectorsDropdownItem,
  ServicesDropdownItem,
} from "@/lib/api/types";
import MenuOverlay from "./MenuOverlay";
import ServicesDropdownPanel from "./ServicesDropdownPanel";
import { useCaseStudyHeaderInfo } from "./CaseStudyHeaderContext";
import { COMING_SOON_HREF } from "@/lib/comingSoon";

gsap.registerPlugin(ScrollTrigger);

export default function Header({
  topBarLinks,
  menuLinks,
  sectorsDropdown,
  servicesDropdown,
  socialLinks,
}: {
  topBarLinks: NavigationLinkItem[];
  menuLinks: NavigationLinkItem[];
  sectorsDropdown: SectorsDropdownItem[];
  servicesDropdown: ServicesDropdownItem[];
  socialLinks: NavigationLinkItem[];
}) {
  const headerRef = useRef<HTMLElement>(null);
  const lockupRef = useRef<HTMLAnchorElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const charsRef = useRef<HTMLSpanElement[]>([]);
  const navRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const servicesPanelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [activeService, setActiveService] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const pathname = usePathname();
  const caseStudyInfo = useCaseStudyHeaderInfo();

  // CMS-authored hrefs can be placeholders ("#"), external URLs or carry a
  // query/hash — only same-site paths can ever be "the page you're on".
  // A nested route (e.g. /sectors/fintech) keeps its parent link lit.
  function isActiveHref(href: string) {
    const path = (href ?? "").split(/[?#]/)[0].replace(/\/+$/, "");
    if (!path.startsWith("/")) return false;

    // Coming Soon is where every destination this site doesn't build lands
    // (`lib/comingSoon.ts`), so on that page it is the current path for most
    // of the nav at once — lighting all of them would say nothing. It is a
    // holding page, never a section, so it is never the page you are on.
    if (path === COMING_SOON_HREF) return false;

    return pathname === path || pathname.startsWith(`${path}/`);
  }

  useEffect(() => {
    if (!servicesOpen) return;

    // The panel itself lives outside `servicesRef` (it's a direct child of
    // `<header>` so its `absolute inset-x-0` spans the full header width,
    // not just the trigger's) — a click landing inside it must not count as
    // "outside", so both refs are checked.
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        servicesRef.current &&
        !servicesRef.current.contains(target) &&
        servicesPanelRef.current &&
        !servicesPanelRef.current.contains(target)
      ) {
        closeServices();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [servicesOpen]);

  // Note: the menu deliberately does *not* freeze body scroll. Locking it
  // means `overflow: hidden`, which drops the desktop scrollbar and nudges
  // every right-anchored element as the layout viewport widens — the page
  // behind being scrollable is the accepted trade for nothing moving.

  useEffect(() => {
    const header = headerRef.current;
    const lockup = lockupRef.current;
    if (!header || !lockup) return;

    // Order the stagger targets right-to-left through the text (last
    // character first) with the logo appended at the very end, so the
    // default index-based stagger (index 0 = least delay) falls one by one
    // from the right and lands on the logo last.
    const reversedChars = [...charsRef.current].reverse();
    const targets = [...reversedChars, logoRef.current].filter(
      (el): el is HTMLElement => el !== null,
    );

    // The intro plays as a full-viewport splash, so it has to sit above the
    // footer (z-60) while it runs — otherwise reloading at the bottom of the
    // page hides it. Once collapsed to the 54px bar, it drops back under.
    // overflow is clipped so nothing spills past the header bounds
    // mid-animation, and released once "start a project" needs to poke out
    // above the collapsed bar.
    gsap.set(header, { zIndex: 100 });

    // The lockup is `position: fixed` and already sits at its final resting
    // spot (bottom-left of the collapsed bar) from the very first frame —
    // it never moves. What animates is each character + the logo
    // individually: an explicit `y` pulls each one up to the vertical
    // center of the viewport, computed straight off the lockup's
    // already-final rect, then eases back down to 0. That makes the drop
    // distance/feel author-controlled rather than an emergent side effect
    // of the header's own height tween (which still collapses concurrently
    // purely for the bar's visual size, decoupled from this).
    const lockupRect = lockup.getBoundingClientRect();
    const finalCenterY = lockupRect.top + lockupRect.height / 2;
    const initialY = window.innerHeight / 2 - finalCenterY;
    gsap.set(targets, { y: initialY });

    const tl = gsap.timeline({
      delay: 0.3,
      onComplete: () => {
        gsap.set(header, { zIndex: 50, overflow: "visible" });
        // The scroll-driven text fade must not even exist until the logo has
        // actually landed back in its resting spot — mounting it earlier and
        // merely disabling it isn't enough, since ScrollTrigger computes and
        // renders an initial progress synchronously on creation, which can
        // fire ahead of the disable call.
        setIntroDone(true);
      },
    });

    tl.to(header, {
      height: 54,
      duration: 1.2,
      ease: "power3.inOut",
    })
      .to(
        targets,
        {
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          stagger: { each: 0.05 },
        },
        "<",
      )
      .fromTo(
        navRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power1.out" },
        "-=0.2",
      );

    return () => {
      tl.kill();
    };
  }, []);

  useEffect(() => {
    if (!introDone) return;

    const cta = ctaRef.current;
    if (!cta) return;

    gsap.set(cta, { autoAlpha: 0, y: 16 });

    // Right-to-left order: last character first, so the stagger sweeps
    // from the end of "Stikkman UX" back toward the start. Driven by a
    // single scrubbed timeline, scrolling back up just replays this same
    // tween backwards through time — which naturally unwinds it
    // left-to-right without needing a second, reversed stagger order.
    const chars = [...charsRef.current].reverse();

    // Absolute-positioned against the header, so it only makes sense once
    // there's a full page of content behind it. Measured from the Hero
    // section's own top (falls back to the page top on routes without a
    // Hero) rather than a flat scroll offset, so it stays correct if the
    // Hero's height ever changes. scrub ties progress directly to scroll
    // position instead of firing a fixed-duration tween on enter/leave.
    const tl = gsap.timeline({
      scrollTrigger: {
        start: () => {
          const hero = document.getElementById("hero");
          const heroTop = hero
            ? hero.getBoundingClientRect().top + window.scrollY
            : 0;
          return heroTop + window.innerHeight * 0.5;
        },
        end: "+=250",
        scrub: true,
      },
    });

    // `autoAlpha`, not `opacity`: the lockup is a link to the home page, so a
    // faded-out character must stop being a click target too, not just stop
    // being drawn. autoAlpha flips `visibility: hidden` the moment a char
    // reaches 0 (and back on scroll up), and a hidden element is skipped by
    // hit-testing — see the pointer-events note on the lockup markup below,
    // which is the other half of this.
    tl.to(cta, { autoAlpha: 1, y: 0, ease: "none" }, 0).to(
      chars,
      { autoAlpha: 0, ease: "none", stagger: { each: 0.03 } },
      0,
    );

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, [introDone]);

  const text = "Stikkman UX";

  function handleMenuToggle() {
    const header = headerRef.current;
    const overlay = overlayRef.current;
    if (!header) return;

    setMenuOpen((open) => {
      const next = !open;

      if (next) gsap.set(header, { zIndex: 100 });

      gsap.to(header, {
        height: next ? "100dvh" : 54,
        duration: 0.9,
        ease: "power3.inOut",
        onComplete: () => {
          if (!next) gsap.set(header, { zIndex: 50 });
        },
      });

      if (overlay) {
        gsap.to(overlay, {
          autoAlpha: next ? 1 : 0,
          duration: next ? 0.5 : 0.35,
          delay: next ? 0.35 : 0,
          ease: "power2.out",
        });
      }

      return next;
    });
  }

  // Same imperative height-tween idiom as `handleMenuToggle` above, just
  // scaled to the services panel instead of the whole header: GSAP owns the
  // panel's `height` directly (tweening to `"auto"` — GSAP measures the
  // content's natural height itself, no manual scrollHeight bookkeeping
  // needed) rather than a CSS transition/grid-rows trick.
  function handleServicesToggle() {
    const panel = servicesPanelRef.current;
    if (!panel) return;

    setServicesOpen((open) => {
      const next = !open;

      gsap.to(panel, {
        height: next ? "auto" : 0,
        duration: 0.6,
        ease: "power3.inOut",
      });

      return next;
    });
  }

  // Forces the panel closed (outside click, or navigating via one of its own
  // links) — same GSAP tween as the toggle above, but a no-op while already
  // closed so it never re-triggers the close animation pointlessly.
  function closeServices() {
    const panel = servicesPanelRef.current;
    if (!panel) return;

    setServicesOpen((open) => {
      if (!open) return open;

      gsap.to(panel, {
        height: 0,
        duration: 0.6,
        ease: "power3.inOut",
      });

      return false;
    });
  }

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 bottom-0 z-50 h-dvh overflow-hidden bg-[#392B56]"
    >
      <div
        ref={overlayRef}
        aria-hidden={!menuOpen}
        className="invisible absolute inset-0 opacity-0"
      >
        <MenuOverlay
          menuLinks={menuLinks}
          sectorsDropdown={sectorsDropdown}
          servicesDropdown={servicesDropdown}
          socialLinks={socialLinks}
          onNavigate={handleMenuToggle}
        />
      </div>

      {/* A direct child of `<header>` (not nested inside `servicesRef`) so
          its `absolute inset-x-0 bottom-full` spans the header's own full
          viewport width and sits flush above its top edge, rather than the
          narrow trigger wrapper's — it grows upward from there without ever
          overlapping the header bar itself. */}
      <ServicesDropdownPanel
        ref={servicesPanelRef}
        items={servicesDropdown}
        open={servicesOpen}
        activeIndex={activeService}
        onActiveIndexChange={setActiveService}
        onNavigate={closeServices}
      />

      {/* The link's own box stays inert (`pointer-events-none`) and the parts
          that are actually drawn opt back in — otherwise the box would still
          span the full width of the wordmark after the scroll tween has faded
          it out, leaving a strip of empty header that silently navigates
          home. Clicks on the children still bubble up to this anchor, and
          pointer-events never affects keyboard focus, so the link stays fully
          operable. Each character is hidden with `visibility` rather than
          plain opacity (see the tween above), which is what takes it out of
          hit-testing as it fades. */}
      <Link
        href="/"
        ref={lockupRef}
        className="pointer-events-none absolute bottom-3.75 left-6 flex items-center gap-3 lg:left-14"
      >
        <img
          ref={logoRef}
          src="/LOGO.svg"
          alt="Stikkman UX"
          className="pointer-events-auto h-6 w-6"
        />

        <span className="flex text-lg text-white">
          {text.split("").map((char, i) => (
            <span
              key={i}
              ref={(el) => {
                if (el) charsRef.current[i] = el;
              }}
              className="pointer-events-auto inline-block whitespace-pre font-cabinet-bold font-bold "
            >
              {char}
            </span>
          ))}
        </span>
      </Link>

      {/* Case-study pages only: published into `CaseStudyHeaderContext` by
          `CaseStudyHeaderTitle`, mounted from `work/[slug]/page.tsx`. "Work"
          links back to the listing page; the chevrons step to the previous/
          next published case study (server-computed, wraps around). Both
          siblings are `null` only in a should-never-happen edge case (see
          `getPublicCaseStudyBySlug`) — hide a chevron rather than render a
          dead link. */}
      {caseStudyInfo && (
        <div
          aria-hidden={menuOpen}
          className={`absolute bottom-3.75 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs leading-4 tracking-[1.8px] transition-opacity lg:flex ${
            menuOpen
              ? "pointer-events-none opacity-0 duration-200 delay-0"
              : "opacity-100 duration-300 delay-[350ms]"
          }`}
        >
          <Link
            href="/work-innovation"
            className="uppercase font-mono text-white/60 transition-colors duration-200 hover:text-white"
          >
            Work
          </Link>
          <span className="text-white/40">|</span>
          <span className="flex items-center gap-2 text-white">
            {caseStudyInfo.previousCaseStudy ? (
              <Link
                href={`/work/${caseStudyInfo.previousCaseStudy.slug}`}
                aria-label={`Previous project: ${caseStudyInfo.previousCaseStudy.title}`}
                className="text-white/60 transition-colors duration-200 hover:text-white"
              >
                <svg
                  className="h-3 w-3"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    d="M12.5 15l-5-5 5-5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            ) : (
              <span className="h-3 w-3" aria-hidden="true" />
            )}

            {caseStudyInfo.title}

            {caseStudyInfo.nextCaseStudy ? (
              <Link
                href={`/work/${caseStudyInfo.nextCaseStudy.slug}`}
                aria-label={`Next project: ${caseStudyInfo.nextCaseStudy.title}`}
                className="text-white/60 transition-colors duration-200 hover:text-white"
              >
                <svg
                  className="h-3 w-3"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    d="M7.5 15l5-5-5-5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            ) : (
              <span className="h-3 w-3" aria-hidden="true" />
            )}
          </span>
        </div>
      )}

      {/* The header is `position: fixed`, so it widens by the scrollbar's
          width whenever something else on the page freezes body scroll (the
          testimonial video lightbox) — body padding can't hold anything in
          here still. This gives that width back as a margin so the nav
          doesn't drift sideways. `--scrollbar-width` only exists while a lock
          is held, so this is 0 the rest of the time. (`right` is an inset,
          not a margin: a margin-right on an absolutely-positioned box offsets
          it inward from that inset.) */}
      <div
        ref={navRef}
        style={{ marginRight: "var(--scrollbar-width, 0px)" }}
        className="absolute bottom-3.75 right-6 flex items-center gap-8 text-xs leading-4 font-normal tracking-[1.8px] text-white/70 opacity-0 lg:right-14"
      >
        <div
          ref={servicesRef}
          aria-hidden={menuOpen}
          className={`relative cursor-pointer hidden lg:block transition-opacity ${menuOpen ? "opacity-0 duration-200 delay-0 pointer-events-none" : "opacity-100 duration-300 delay-[350ms]"}`}
        >
          <button
            type="button"
            onClick={handleServicesToggle}
            aria-expanded={servicesOpen}
            className={`uppercase text-xs leading-4 cursor-pointer tracking-[1.84px] transition-colors duration-200 font-mono ${servicesOpen || isActiveHref("/services") ? "text-white" : "hover:text-white"}`}
          >
            Services
          </button>
        </div>

        {topBarLinks.map((link) => {
          const active = isActiveHref(link.href);

          return (
            <a
              key={link.label}
              href={link.href}
              aria-hidden={menuOpen}
              aria-current={active ? "page" : undefined}
              // The opacity fade is deliberately delayed so the nav reappears
              // after the menu overlay has closed — but that delay must not
              // leak onto `color`, or hovering would lag by 350ms. Hence the
              // per-property transition instead of a shared duration/delay.
              className={`hidden uppercase text-xs leading-4 tracking-[1.84px] font-mono lg:block ${active ? "text-white" : "hover:text-white"} ${
                menuOpen
                  ? "opacity-0 pointer-events-none [transition:color_200ms_ease,opacity_200ms_ease_0ms]"
                  : "opacity-100 [transition:color_200ms_ease,opacity_300ms_ease_350ms]"
              }`}
            >
              {link.label}
            </a>
          );
        })}

        <button
          type="button"
          onClick={handleMenuToggle}
          aria-expanded={menuOpen}
          className={`flex cursor-pointer items-center gap-2 uppercase transition-colors duration-200 hover:text-white ${menuOpen ? "text-white" : ""}`}
        >
          Menu
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {/* Flush against the header top, so the wing corners below need to
          land exactly on its edge with no gap for the merge to read as
          one continuous shape.

          The shape is wrapped in a real <button> rather than left as a bare
          `cursor-pointer` <svg>: it's the site's primary CTA, so it has to be
          reachable by keyboard and announced as a control. Positioning, the
          GSAP ref and the hover `group` all live on the button now — the svg
          is purely the drawing. `data-contact-cta` is what opts it into the
          scroll-to-form behaviour (see `lib/contactCta.ts`). */}
      <button
        ref={ctaRef}
        type="button"
        data-contact-cta
        aria-label="Start a project"
        className="group inline-block invisible absolute -z-10 bottom-full left-1/2 -translate-x-1/2 opacity-0 cursor-pointer "
      >
      <svg
        width="216"
        height="36"
        viewBox="0 0 216 36"
        fill="none"
        className="block"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Figma exports a `data-figma-bg-blur-radius` hint plus this
            clipPath but never wires up an actual blur — CSS `backdrop-filter`
            (via a foreignObject) is the only thing that genuinely samples the
            real pixels behind the shape; an SVG filter can't. Offset by
            -16.6 (the blur radius) and shifted back by the clipPath's own
            translate so the clipped shape still lines up with the visible
            path below, with enough margin that the blur doesn't get a hard
            edge at the shape's boundary. */}
        <foreignObject x="-16.6" y="-16.6" width="249.2" height="91.7">
          <div
            className="h-full w-full"
            style={{
              clipPath: "url(#bgblur_0_189_4209_clip_path)",
              backdropFilter: "blur(16.6px)",
              WebkitBackdropFilter: "blur(16.6px)",
            }}
          />
        </foreignObject>

        <path
          d="M38.4443 0.5H175.888C185.253 0.500075 192.469 5.43037 198.438 12.5518C204.415 19.6834 209.091 28.9519 213.383 37.5176C214.885 40.5158 215.443 45.8285 214.743 50.4111C214.394 52.6962 213.739 54.7464 212.775 56.2109C211.818 57.6652 210.591 58.5 209.063 58.5H7.46191C5.56882 58.4999 4.11763 57.6411 3.02832 56.2002C1.92605 54.7421 1.19829 52.6877 0.817383 50.3516C0.0549948 45.6756 0.712872 40.0568 2.29102 36.335C5.93282 27.7463 10.3917 18.7705 16.2461 11.9463C22.0935 5.13024 29.2967 0.5 38.4443 0.5Z"
          fill="#4B4B4B69"
          fillOpacity="0.9"
          stroke="white"
          className="transition-colors duration-300 group-hover:fill-[#392B56]"
        />
        <defs>
          <clipPath
            id="bgblur_0_189_4209_clip_path"
            transform="translate(16.6 16.6)"
          >
            <path d="M38.4443 0.5H175.888C185.253 0.500075 192.469 5.43037 198.438 12.5518C204.415 19.6834 209.091 28.9519 213.383 37.5176C214.885 40.5158 215.443 45.8285 214.743 50.4111C214.394 52.6962 213.739 54.7464 212.775 56.2109C211.818 57.6652 210.591 58.5 209.063 58.5H7.46191C5.56882 58.4999 4.11763 57.6411 3.02832 56.2002C1.92605 54.7421 1.19829 52.6877 0.817383 50.3516C0.0549948 45.6756 0.712872 40.0568 2.29102 36.335C5.93282 27.7463 10.3917 18.7705 16.2461 11.9463C22.0935 5.13024 29.2967 0.5 38.4443 0.5Z" />
          </clipPath>
        </defs>

        {/* Sized to the visible viewBox (not the path's own, taller
            coordinate space, part of which is clipped) so the text centers
            on what's actually on screen. */}
        <foreignObject x="0" y="0" width="216" height="36">
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-mono text-xs uppercase tracking-[1.84px] text-white">
              Start a project
            </span>
          </div>
        </foreignObject>
      </svg>
      </button>
    </header>
  );
}

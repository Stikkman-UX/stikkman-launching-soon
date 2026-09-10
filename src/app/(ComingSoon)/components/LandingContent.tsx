"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import FluidContainer from "@/app/(ComingSoon)/components/FluidContainer";
import HighlightMark from "@/app/shared/HighlightMark";
import { ButtonBlue, ButtonWhite } from "@/app/shared/Button";
import Countdown from "@/app/(ComingSoon)/components/Countdown";
import LogoCarousel from "@/app/(ComingSoon)/components/LogoCarousel";
import RequestModal from "@/app/(ComingSoon)/components/RequestModal";
import { CONTACT_HREF } from "@/lib/contactCta";
import {
  eyebrow,
  headingLines,
  heroRotatingWords,
  requestCtas,
  type RequestCta,
} from "@/app/(ComingSoon)/data/landing";

const ROTATE_INTERVAL_MS = 2400;
const ROTATE_DURATION = 0.7;

// Duplicate the first word onto the end so the rotation can loop by always
// stepping forward and snapping back once the duplicate is fully in view.
const rotatorItems = [...heroRotatingWords, heroRotatingWords[0]];

/**
 * The landing copy and its entrance choreography, in two absolutely
 * positioned blocks over the section's video:
 *
 * - the statement — heading, sector row, intro line and CTAs — sits left,
 *   centred on the vertical axis only. It keeps the site's left-aligned grid
 *   rather than being centred horizontally too, and the four parts stay one
 *   block rather than being split across the screen;
 * - the "coming soon" mark and the countdown sit in the bottom-right corner
 *   as secondary, at-a-glance information.
 *
 * Every size is fluid (see the `@theme` block in globals.css), so the two
 * blocks hold the same proportions from a 360px phone to a 40-inch display
 * instead of stranding a fixed-width composition in the middle of a large
 * screen.
 *
 * The heading carries both of the live site's hero effects:
 *
 * 1. the reveal — every line is an outer `span.block.overflow-hidden` clip
 *    mask with an inner `span.block` tweened from `yPercent: 115` with
 *    `back.out(1.6)` (main site's `about/components/AnimatedHeroHeading.tsx`);
 * 2. the rotator — the middle line cycles through `heroRotatingWords` on a
 *    loop once the reveal lands (main site's `(Home)/components/HeroHeading`).
 *
 * Everything else fades up afterwards, the same way the Home hero's CTA row
 * does. The 1.3s delay waits out the header intro (0.3s delay + ~1.5s of
 * tweens in `shared/Header.tsx`), so the splash has collapsed to its bar
 * before the page starts writing itself in.
 */
export default function LandingContent() {
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rotatorTrackRef = useRef<HTMLSpanElement>(null);

  const [request, setRequest] = useState<RequestCta | null>(null);
  // Captured when the modal opens so focus can go back where it came from on
  // close. Reading `document.activeElement` at that moment is enough — the
  // button that opened it is the focused element.
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const lines = lineRefs.current.filter(
      (el): el is HTMLSpanElement => el !== null,
    );
    const tail = tailRefs.current.filter(
      (el): el is HTMLDivElement => el !== null,
    );

    const tl = gsap.timeline({ delay: 1.3 });
    let rotateTl: gsap.core.Timeline | undefined;

    tl.fromTo(
      lines,
      { yPercent: 115 },
      { yPercent: 0, duration: 1.1, ease: "back.out(1.6)", stagger: 0.12 },
      0,
    )
      .call(() => {
        const track = rotatorTrackRef.current;
        if (!track) return;

        // One self-contained repeating timeline, rather than a setInterval
        // firing one-off tweens: rAF suspends in a background tab, so a
        // counter driven that way would run away while the tab is hidden and
        // park the track on an empty line.
        rotateTl = gsap.timeline({ repeat: -1 });
        const holdSeconds = ROTATE_INTERVAL_MS / 1000 - ROTATE_DURATION;

        rotatorItems.slice(1).forEach((_, i) => {
          rotateTl!.to(
            track,
            {
              // yPercent is a share of the track's *own* height, which
              // `inset-0` pins to exactly one line.
              yPercent: -100 * (i + 1),
              duration: ROTATE_DURATION,
              ease: "power3.inOut",
            },
            `+=${holdSeconds}`,
          );
        });

        // The last step lands on the duplicated first word, so snapping back
        // to 0 is invisible and the loop reads as continuous.
        rotateTl.set(track, { yPercent: 0 });
      })
      .fromTo(
        tail,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power2.out",
          stagger: 0.12,
        },
        "-=0.4",
      );

    return () => {
      tl.kill();
      rotateTl?.kill();
    };
  }, []);

  // The site header is global and carries a “let’s talk” CTA that opts into
  // the scroll-to-the-footer-form behaviour by marking itself
  // `data-contact-cta` (see `lib/contactCta.ts`). This page has no footer —
  // it is one full screen — so `ContactCtaListener` finds no `#contact`
  // anchor, leaves the click alone, and a button CTA then does nothing at all.
  //
  // Route it into this page’s own callback request instead, which asks for
  // exactly what the footer form asks for. Capture phase and the same guards
  // as that listener, so the two agree on which clicks count as a contact CTA.
  useEffect(() => {
    function handleContactCta(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const trigger = (event.target as Element | null)?.closest?.(
        `a[href*="${CONTACT_HREF}"], [data-contact-cta]`,
      );
      if (!trigger) return;

      event.preventDefault();
      openRequest(
        requestCtas.caseStudy,
        trigger instanceof HTMLElement ? trigger : null,
      );
    }

    document.addEventListener("click", handleContactCta, true);
    return () => document.removeEventListener("click", handleContactCta, true);
  }, []);

  function openRequest(cta: RequestCta, trigger?: HTMLElement | null) {
    triggerRef.current =
      trigger ??
      (document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null);
    setRequest(cta);
  }

  function closeRequest() {
    setRequest(null);

    const trigger = triggerRef.current;
    triggerRef.current = null;
    if (trigger?.isConnected) trigger.focus();
  }

  return (
    <>
      {/* Two layouts from one tree.

          Below `lg` this wrapper is a real flex column over the section: the
          statement takes whatever height the bottom block leaves and centres
          vertically in it, so a tall phone or a tablet balances the
          composition instead of stranding the text high with a void beneath.
          Nothing has to guess the block's height — it is simply in flow.

          On `lg` the wrapper is `display: contents`, which removes it from
          layout entirely: its two children go back to being absolutely
          positioned against the section — the statement centred on the
          vertical axis over the full height, the bottom row pinned to the
          bottom edge — exactly the desktop composition as drawn. */}
      <div className="absolute inset-0 z-10 flex flex-col lg:contents">
      {/* Centred on the vertical axis only, on the grid's left edge, at every
          size — the text stays left-aligned on a phone too.

          Mobile: `pt-16` so the centring runs between the meta bar and the
          bottom block rather than from the screen's top edge.

          `lg`: the `pb` is what lifts it clear of the logo strip: the box is
          `inset-0`, so padding at the bottom offsets the centring by half its
          value — normally the reason not to put any here, and exactly the
          mechanism wanted with the bottom-left corner occupied. It is the
          same expression the bottom row uses for its own offset, so the two
          move together. */}
      <FluidContainer className="relative z-10 flex min-h-0 flex-1 items-center pt-16 lg:absolute lg:inset-0 lg:min-h-full lg:flex-none lg:pt-0 lg:pb-[calc(var(--spacing-bar)+var(--spacing-fluid-md))]">
        <div>
          {/* No width cap on the heading, deliberately. The rotator words are
              `whitespace-nowrap` — they have to be, or a long one would wrap
              inside a clip sized for a single line — so a `max-width` here
              would not wrap the longest line, it would let the reveal mask
              clip it. The gutter is the only constraint, and the type scale's
              26px floor is what keeps "DIGITAL EXPERIENCE" inside it at the
              360px viewport floor. The measure lives on the intro paragraph
              instead, which is the text that actually needs one. */}
          <h1 className="no-text-trim text-hero font-normal text-[#392B56CC]">
            {headingLines.map((line, i) => (
              <span key={line.text} className="block overflow-hidden">
                <span
                  ref={(el) => {
                    lineRefs.current[i] = el;
                    return () => {
                      lineRefs.current[i] = null;
                    };
                  }}
                  className={`block ${line.highlight ? "text-[#392B56]" : ""}`}
                >
                  {line.rotate ? (
                    // Rotation clip: sized by the in-flow transparent spacer,
                    // which also carries the text for assistive tech and for
                    // the pre-JS render; the absolutely positioned track is
                    // what actually animates.
                    <span className="relative block overflow-hidden">
                      <span className="block whitespace-nowrap opacity-0">
                        {line.text}
                      </span>
                      <span
                        ref={rotatorTrackRef}
                        aria-hidden="true"
                        className="absolute inset-0 flex flex-col"
                      >
                        {rotatorItems.map((word, index) => (
                          <span key={index} className="block whitespace-nowrap">
                            {word}
                          </span>
                        ))}
                      </span>
                    </span>
                  ) : (
                    line.text
                  )}
                </span>
              </span>
            ))}
          </h1>

          {/* Each block starts hidden in the markup, not just in the tween, so
              there is no flash of finished layout before GSAP's first frame —
              same idiom as the Home hero's CTA row. */}
          <div
            ref={(el) => {
              tailRefs.current[0] = el;
            }}
            className="mt-fluid-sm flex flex-wrap items-center opacity-0"
          >
            {/* Fluid like everything else in this column, or the label holds
                its size while the heading above it grows with the viewport
                and the line all but vanishes on a large display. Stepped
                down with the headline to make room for the logo strip below;
                the 14px floor is the phone size, where 0.95vw would be under
                4px. */}
            <span className="text-[max(14px,0.95vw)] text-[#392B56E5]">
              Experience Launching Soon
            </span>
          </div>

          <div
            ref={(el) => {
              tailRefs.current[1] = el;
            }}
            className="mt-stack-lg opacity-0"
          >
            {/* `em` measure so the paragraph keeps ~36 characters per line at
                any size, rather than growing narrower in proportion as the
                type scales up. */}

            {/* Left at the site's own button size (`h-11 px-6` in
                `shared/Button.tsx`) on purpose — the headline and the launch
                line above them came down to make room for the logo strip, but
                these did not. The CTAs are the one thing on this page a
                visitor is meant to hit. */}
            <div className="mt-stack flex flex-wrap items-center gap-fluid-xs">
              <ButtonBlue
                text={requestCtas.deck.label}
                onClick={() => openRequest(requestCtas.deck)}
              />
              <ButtonWhite
                text={requestCtas.caseStudy.label}
                onClick={() => openRequest(requestCtas.caseStudy)}
              />
            </div>
          </div>
        </div>
      </FluidContainer>

      {/* The bottom block. On `lg` it is one row — logo strip left, countdown
          right, `items-end` so the logos sit on the countdown's own baseline
          rather than floating somewhere near it. Below `lg` it is a column:
          the strip across the full width, the countdown under it, both on
          the left edge so the whole phone layout reads down one axis.

          `pointer-events-none` because this box spans the full width and
          would otherwise sit over the CTA buttons and swallow their clicks —
          nothing in here is interactive.

          No eyebrow over the strip, unlike the countdown: on `lg` the CTA
          row sits directly above that corner, and a label there lands close
          enough to the buttons to read as part of them. The logos say what
          they are. */}
      <FluidContainer className="pointer-events-none relative z-10 flex shrink-0 flex-col gap-fluid-md pb-[calc(var(--spacing-bar)+var(--spacing-fluid-md))] lg:absolute lg:inset-x-0 lg:bottom-0 lg:flex-row lg:items-end">
        <div
          ref={(el) => {
            tailRefs.current[2] = el;
          }}
          className="w-full opacity-0 lg:w-[34vw]"
        >
          <LogoCarousel />
        </div>

        {/* `lg:ml-auto` rather than `justify-between` on the row: it keeps
            the countdown on the right regardless of what else the row holds. */}
        <div
          ref={(el) => {
            tailRefs.current[3] = el;
          }}
          className="flex flex-col items-start gap-fluid-sm opacity-0 lg:ml-auto lg:items-end"
        >
          <HighlightMark
            text={eyebrow}
            className="text-[#8A8781] lg:text-right"
            sizeClassName="text-micro tracking-[0.1725em]"
          />
          <Countdown />
        </div>
      </FluidContainer>
      </div>

      <RequestModal request={request} onClose={closeRequest} />
    </>
  );
}

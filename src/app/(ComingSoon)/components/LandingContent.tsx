"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Container from "@/app/shared/Container";
import HighlightMark from "@/app/shared/HighlightMark";
import { ButtonBlue, ButtonWhite } from "@/app/shared/Button";
import Countdown from "@/app/(ComingSoon)/components/Countdown";
import RequestModal from "@/app/(ComingSoon)/components/RequestModal";
import {
  eyebrow,
  headingLines,
  heroRotatingWords,
  requestCtas,
  services,
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

  function openRequest(cta: RequestCta) {
    triggerRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
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
      {/* `items-center` centres this column on the vertical axis only; the
          column itself stays on the grid's left edge.

          No padding on this box at all: it is `inset-0`, so any `pb` here
          offsets the centring by half its value and the column sits visibly
          high of the middle — which the top meta bar makes obvious, since it
          gives the eye a fixed reference at the top edge. */}
      <Container className="absolute inset-0 z-10 flex items-center">
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
            className="mt-10 flex flex-wrap items-center opacity-0"
          >
            <span className="text-base text-[#392B56E5]">
              New Website Launching Soon
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
      </Container>

      {/* Bottom-right corner. `pointer-events-none` because this box spans the
          full width and would otherwise sit over the CTA buttons and swallow
          their clicks — nothing in here is interactive. */}
      <Container className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-end pb-[calc(var(--spacing-bar)+var(--spacing-fluid-md))]">
        <div
          ref={(el) => {
            tailRefs.current[2] = el;
          }}
          className="flex flex-col items-end gap-fluid-sm opacity-0"
        >
          <HighlightMark text={eyebrow} className="text-right text-[#8A8781]" />
          <Countdown />
        </div>
      </Container>

      <RequestModal request={request} onClose={closeRequest} />
    </>
  );
}

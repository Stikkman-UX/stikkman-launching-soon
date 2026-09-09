"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { CmsButton } from "@/lib/api/types";
import ContentButton from "@/app/shared/ContentButton";
import { heroRotatingWords, heroStaticLines } from "@/app/(Home)/data/hero";

const ROTATE_INTERVAL_MS = 2400;
const ROTATE_DURATION = 0.7;

// Duplicate the first word onto the end so the rotation can loop by always
// stepping forward and snapping back once the duplicate is fully in view,
// instead of rewinding backwards through the list.
const rotatorItems = [...heroRotatingWords, heroRotatingWords[0]];

export default function HeroHeading({
  primaryCta,
  secondaryCta,
}: {
  primaryCta: CmsButton;
  secondaryCta: CmsButton;
}) {
  const linesRef = useRef<(HTMLSpanElement | null)[]>([]);
  const ctaRef = useRef<HTMLDivElement>(null);
  const rotatorTrackRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Timed to pick up right as the header intro (Header.tsx) settles —
    // header: 0.3s delay + 0.7s collapse, with its own 0.5s stagger/fade
    // tail finishing around ~1.3s — so the two read as one continuous
    // sequence instead of a dead gap or an overlap.
    const tl = gsap.timeline({ delay: 0.9 });
    let rotateTl: gsap.core.Timeline | undefined;

    tl.fromTo(
      // Detached lines null themselves out (see the ref cleanups below), so a
      // shorter CMS array can't leave stale elements for GSAP to animate.
      linesRef.current.filter((el) => el !== null),
      { yPercent: 115 },
      {
        yPercent: 0,
        duration: 1.1,
        ease: "back.out(1.6)",
        stagger: 0.15,
      },
    )
      .call(() => {
        // The rotating middle line only starts once the header intro and
        // this reveal have both fully settled, never before.
        const track = rotatorTrackRef.current;
        if (!track) return;

        // One self-contained repeating timeline, rather than a setInterval
        // firing one-off tweens — the interval is what made the rotator go
        // blank. setInterval keeps ticking in a backgrounded tab, but GSAP is
        // driven by requestAnimationFrame, which the browser suspends there.
        // So the counter ran away while the tweens stood still, and the reset
        // that hid the loop seam (an `=== heroRotatingWords.length` equality
        // check inside a tween's onComplete) was stepped straight over: the
        // track ended up parked far below its last word — an empty line — and
        // never recovered, because the counter could no longer equal the
        // length it had already passed. Any dropped frame or overlapping
        // tween reproduced it without a tab switch.
        //
        // A timeline can't desync from its own tweens (same ticker, and GSAP's
        // lag smoothing absorbs the gap on return), and every step below is an
        // absolute destination instead of an accumulating offset, so there is
        // no counter left to run away.
        rotateTl = gsap.timeline({ repeat: -1 });

        const holdSeconds = ROTATE_INTERVAL_MS / 1000 - ROTATE_DURATION;

        rotatorItems.slice(1).forEach((_, i) => {
          rotateTl!.to(
            track,
            {
              // yPercent is a share of the track's *own* height, which
              // `inset-0` pins to exactly one word — so one step is always
              // exactly one item, with nothing to measure. The old pixel
              // maths read `children[0]`'s height on every tick and silently
              // produced a no-op step whenever that measured 0 (webfont still
              // swapping, element not yet laid out), which then compounded
              // into the same runaway.
              yPercent: -100 * (i + 1),
              duration: ROTATE_DURATION,
              ease: "power3.inOut",
            },
            `+=${holdSeconds}`,
          );
        });

        // The last item is a duplicate of the first, so snapping back to the
        // top the instant it lands is invisible — that's what keeps the
        // motion going in one direction instead of rewinding.
        rotateTl.set(track, { yPercent: 0 });
      })
      .fromTo(
        ctaRef.current,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power2.out" },
        "-=0.4",
      );

    return () => {
      tl.kill();
      rotateTl?.kill();
    };
  }, []);

  return (
    <div className="max-w-2xl">
      <h1 className="no-text-trim text-4xl leading-tight font-normal sm:text-5xl lg:text-[70px] lg:leading-17.5 tracking-[-2.16px] text-[#392B56CC] ">
        <span className="block overflow-hidden">
          <span
            ref={(el) => {
              linesRef.current[0] = el;
              return () => {
                linesRef.current[0] = null;
              };
            }}
            className="block"
          >
            {heroStaticLines.first}
          </span>
        </span>

        <span className="block overflow-hidden">
          <span
            ref={(el) => {
              linesRef.current[1] = el;
              return () => {
                linesRef.current[1] = null;
              };
            }}
            className="block"
          >
            {/* Rotation clip: sized by the in-flow (transparent, still
                screen-reader-visible) spacer below; the absolutely
                positioned track is what actually animates and clips
                against these bounds. */}
            <span className="relative block overflow-hidden">
              <span className="block whitespace-nowrap opacity-0">
                {heroRotatingWords[0]}
              </span>
              <span
                ref={rotatorTrackRef}
                aria-hidden="true"
                className="absolute inset-0 flex flex-col"
              >
                {rotatorItems.map((word, i) => (
                  <span key={i} className="block whitespace-nowrap text-[#392B56] ">
                    {word}
                  </span>
                ))}
              </span>
            </span>
          </span>
        </span>

        <span className="block overflow-hidden">
          <span
            ref={(el) => {
              linesRef.current[2] = el;
              return () => {
                linesRef.current[2] = null;
              };
            }}
            className="block"
          >
            {heroStaticLines.last}
          </span>
        </span>
      </h1>

      <div ref={ctaRef} className="mt-8 flex items-center gap-3 opacity-0">
        <ContentButton button={primaryCta} />
        <ContentButton button={secondaryCta} />
      </div>
    </div>
  );
}

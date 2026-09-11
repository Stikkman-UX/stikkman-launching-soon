"use client";

import { heroLogos } from "@/app/(ComingSoon)/data/landing";
import { useMarquee } from "@/lib/hooks/useMarquee";

/**
 * The landing hero's client-logo strip: one row scrolling left, forever.
 *
 * Every logo is `h-[…] w-auto object-contain`, so they all take the exact
 * same height and each keeps its own width — which is what makes a set of
 * mixed-aspect files read as one row rather than a ragged one. From `lg` that
 * height is fluid like everything else on this page (see the `@theme` block
 * in globals.css), so the strip grows with the viewport instead of shrinking
 * into a large display; below `lg` it is a flat, smaller value, because the
 * fluid one is floor-bound at phone widths and its floor reads too heavy
 * there.
 *
 * The list is rendered twice and the track translates by exactly -50%
 * (`useMarquee`), so the second copy is under the cursor at the moment the
 * first one leaves and the loop has no seam. That equality is why the
 * spacing is a right *margin on every item* rather than a flex `gap`: a gap
 * sits only *between* items, so the track would be one gap short of two
 * whole periods and -50% would land slightly off, jumping every lap.
 *
 * The movement is a GSAP tween rather than a CSS animation on purpose — a
 * CSS-animated track this wide goes blank on iPhone; `useMarquee` has the
 * whole story.
 *
 * The mask fades both ends to transparent rather than painting a white
 * gradient over them — the hero's background is a video behind two scrims,
 * so a solid fade would only match the page where the scrim happens to be
 * fully opaque.
 */
const FADE =
  "linear-gradient(90deg, transparent 0, black 10%, black 88%, transparent 100%)";

/**
 * A lap of the whole list, not a speed, so it has to be re-tuned whenever
 * logos are added or removed — or the spacing below changes, or a mark is
 * swapped for a file with a different aspect ratio. All three are just the
 * track getting longer or shorter, which is the whole of what a lap is.
 * These 11 run ~1390px on a phone and ~1630px on a 1440px display, so this
 * 28s reads as roughly 50px/sec and 58px/sec, both a readable walking pace.
 * Halve the list and this same 28s would crawl.
 */
const LAP_SECONDS = 28;

export default function LogoCarousel({ className = "" }: { className?: string }) {
  const trackRef = useMarquee<HTMLDivElement>(LAP_SECONDS);

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{ maskImage: FADE, WebkitMaskImage: FADE }}
    >
      <div ref={trackRef} className="flex w-max items-center">
        {[...heroLogos, ...heroLogos].map((logo, i) => {
          const isDuplicate = i >= heroLogos.length;

          return (
            <img
              key={i}
              src={logo.src}
              // The second copy is the same logos again, so it is announced
              // once, not twice.
              alt={isDuplicate ? "" : logo.name}
              aria-hidden={isDuplicate || undefined}
              // One height for every mark, `w-auto` for every width. On a
              // phone that is a flat 26px: the fluid expression below is
              // floor-bound under about 1700px, so on mobile it would only
              // ever be its 34px floor — too heavy against the type at that
              // width, where the strip runs the full screen rather than
              // sitting in the desktop corner. From `lg` the fluid value
              // takes over, and its floor is what keeps the marks legible on
              // a laptop rather than scaling them down with the viewport.
              //
              // Spacing is authored per breakpoint rather than scaled from
              // one value. A phone gets a flat 40px, which is what keeps a
              // full-width row of shorter marks from crowding. From `lg` it
              // goes fluid so the gaps grow with the marks either side of
              // them instead of closing up on a large display, and its 28px
              // floor is the value tuned for the desktop corner, where the
              // strip is only ~34vw across.
              className="mr-10 h-[26px] w-auto object-contain lg:mr-[max(28px,2.5vw)] lg:h-[max(34px,2vw)]"
            />
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Scrolls a track left forever, one lap (half its width) every `lapSeconds`.
 *
 * Pair it with a track that renders its items twice and lays them out with
 * `w-max` (see `(ComingSoon)/components/LogoCarousel.tsx`): the track moves
 * from 0 to -50% of its own width and snaps back, so the second copy is
 * exactly under the first at the moment of the snap and the loop has no
 * seam. The percentage is left to the browser to resolve, so a logo that
 * finishes loading mid-lap simply re-resolves it — nothing here measures.
 *
 * Why a JS tween and not a CSS `@keyframes` animation, which is the obvious
 * tool for this: iOS WebKit. A track of a dozen logos runs ~2600px wide,
 * which at a phone's 2-3× pixel ratio is far past the 2048 device-pixel
 * threshold at which WebKit backs a composited layer with 512px *tiles*
 * rather than one bitmap. A CSS transform animation runs on the compositor,
 * so the main thread — which decides which tiles are worth painting — is
 * left guessing where the track is; on iPhone that guess drifts within a
 * lap or two, tiles the track has scrolled into are dropped or never
 * painted, and the strip shows as empty with a hard vertical edge that sits
 * on a tile boundary. Desktop at 1× never crosses the tiling threshold, so
 * it never shows.
 *
 * Driving the transform from here, every frame, means the position WebKit
 * paints for is always the position it displays. `force3D: false` on top of
 * that keeps the transform 2D, so the track never gets a composited layer
 * of its own at all — it is painted into its parent, a strip the width of
 * the viewport, and there is nothing to tile. Repainting a 26px-tall row
 * each frame is far cheaper than the bug it avoids.
 *
 * Honours `prefers-reduced-motion`: the track holds still at its start
 * position, which is what the old CSS rule's `animation: none` did.
 */
export function useMarquee<T extends HTMLElement>(lapSeconds: number) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const track = ref.current;
    if (!track) return;

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        track,
        { xPercent: 0 },
        {
          xPercent: -50,
          duration: lapSeconds,
          ease: "none",
          repeat: -1,
          force3D: false,
        },
      );
    });

    // Kills the tween and puts the inline transform back the way it was.
    return () => mm.revert();
  }, [lapSeconds]);

  return ref;
}

"use client";

import type { ReactNode } from "react";
import { useRevealSection } from "@/lib/hooks/useRevealSection";

/**
 * Wraps a section in a plain div carrying the useRevealSection ref +
 * `reveal-section` class, so the section itself (and anything
 * server-rendered inside it) can stay a Server Component; only this thin
 * wrapper crosses the client boundary.
 *
 * Renders `children` untouched rather than cloning it: children handed
 * down from a Server Component parent arrive on the client as an
 * unresolved `react.lazy` placeholder (Next's Flight runtime resolves it
 * transparently only when it's rendered plainly as `{children}`).
 * `cloneElement` reads `.type`/`.props` directly instead of going through
 * that resolution, which throws "Element type is invalid ... got:
 * undefined" the moment a Server Component child crosses this boundary.
 *
 * Not for sections that already carry their own ref (GallerySection,
 * QuoteSection use GSAP directly and are Client Components regardless).
 */
export default function RevealSection({ children }: { children: ReactNode }) {
  const revealRef = useRevealSection<HTMLDivElement>();

  return (
    <div ref={revealRef} className="reveal-section">
      {children}
    </div>
  );
}

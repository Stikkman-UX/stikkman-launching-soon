"use client";

import { useEffect } from "react";
import { initOpticalAlign } from "@/lib/OpticalAlign";

/**
 * Runs the app-wide optical alignment pass (see `@/lib/OpticalAlign`). Renders
 * nothing — it exists only to own the observer's lifecycle from the root
 * layout, the way SmoothScroll owns Lenis's.
 *
 * Applies automatically to every block-level text element on the site; the
 * element list and the eligibility rules live in `OpticalAlign.ts`, and the
 * CSS that consumes the measured value in `globals.css`. Exempt a single
 * element with `data-optical="off"`, or opt an inline one in with
 * `className="optical-align"`.
 */
export default function OpticalAlignProvider() {
  useEffect(() => initOpticalAlign({ mode: "var" }).disconnect, []);
  return null;
}

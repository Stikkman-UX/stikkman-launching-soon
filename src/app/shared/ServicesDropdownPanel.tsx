"use client";

import { forwardRef } from "react";
import type { ServicesDropdownItem } from "@/lib/api/types";
import Container from "./Container";

/**
 * The header's "Services" popup (triggered beside "Sectors" in `Header.tsx`).
 * `absolute inset-x-0 bottom-full` against `<header>` (the nearest positioned
 * ancestor — `Header.tsx` renders this as a direct child of `<header>`, not
 * nested inside the narrow `servicesRef` trigger wrapper, so the inset spans
 * the header's full viewport width rather than that wrapper's) — full width,
 * with its *bottom* edge flush against the header's *top* edge (`bottom-full`
 * = `bottom: 100%` of the header's own box), so it sits entirely above the
 * header and grows upward from there rather than overlapping/covering it.
 *
 * Height, not opacity/translate, drives the open/close animation — GSAP-
 * driven from `Header.tsx`'s `handleServicesToggle`/`closeServices` (same
 * imperative height-tween idiom as the header's own `handleMenuToggle`),
 * tweening this root's `height` between `0` and `"auto"`. The starting
 * `h-0` class is only the pre-JS/first-paint state; GSAP owns the inline
 * `height` style from the first toggle onward, so no `style` prop is set
 * here that could fight it on re-render.
 *
 * The background/shadow spans the full viewport edge-to-edge (full-bleed);
 * the actual heading/grid content is nested in a `Container` so it still
 * lines up with the page's standard gutters instead of touching the screen
 * edges directly.
 *
 * The drop shadow has to live on *this* root rather than on the panel box
 * below it: an element's own `box-shadow` paints outside its border box and
 * so is not clipped by its own `overflow: hidden`, but a child's shadow is —
 * a shadow on the inner panel gets swallowed whole by this wrapper's clip.
 * It's applied only while `open`, since a shadow on the collapsed
 * `height: 0` box would otherwise smear a permanent dark band across the
 * header's top edge; `transition-shadow` carries it back out across the
 * close tween instead of snapping off the instant the state flips.
 *
 * The left preview pane swaps to whichever item is hovered/focused — same
 * "active index, only ever moves forward on hover" idea as
 * `MenuOverlay`'s Sectors card — defaulting to the first item.
 */
const ServicesDropdownPanel = forwardRef<
  HTMLDivElement,
  {
    items: ServicesDropdownItem[];
    open: boolean;
    activeIndex: number;
    onActiveIndexChange: (index: number) => void;
    onNavigate: () => void;
  }
>(function ServicesDropdownPanel(
  { items, open, activeIndex, onActiveIndexChange, onNavigate },
  ref
) {
  const active = items[activeIndex] ?? items[0];

  return (
    <div
      ref={ref}
      aria-hidden={!open}
      className={`absolute inset-x-0 bottom-full h-0 overflow-hidden rounded-t-2xl transition-shadow duration-500 ${
        open ? "shadow-[0_-24px_60px_-12px_rgba(57,43,86,0.35)]" : "shadow-none"
      }`}
    >
      <div className="overflow-hidden rounded-t-2xl bg-[#F6F4FA]">
        <Container className="grid grid-cols-1 lg:grid-cols-[340px_1fr]">
          <div className="flex flex-col gap-6 py-8 lg:pr-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[1.72px] text-[#392B56]/50">
                {"// Services"}
              </p>
              <h3 className="mt-3 text-xl leading-tight text-[#392B56] tracking-[-0.4px]">
                End-to-end design solutions, built to scale.
              </h3>
            </div>

            {active && (
              <a
                href={active.href}
                onClick={onNavigate}
                tabIndex={open ? 0 : -1}
                className="relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-black/10"
              >
                {items.map((item, i) => (
                  <img
                    key={item.title + i}
                    src={item.image}
                    alt={item.title}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                      i === activeIndex ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />
                {active.description && (
                  <p className="absolute inset-x-0 bottom-0 p-4 text-xs leading-5 text-white/90">
                    {active.description}
                  </p>
                )}
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-8 border-t border-[#392B56]/10 py-8 sm:grid-cols-2 lg:grid-cols-3 lg:border-t-0 lg:border-l lg:pl-8">
            {items.map((item, i) => (
              <a
                key={item.title + i}
                href={item.href}
                onMouseEnter={() => onActiveIndexChange(i)}
                onFocus={() => onActiveIndexChange(i)}
                onClick={onNavigate}
                tabIndex={open ? 0 : -1}
                className="block"
              >
                <p className="font-mono text-[10px] text-[#392B56]/40">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p
                  className={`mt-2 text-sm leading-5 transition-colors ${
                    i === activeIndex ? "text-[#392B56]" : "text-[#392B56]/70"
                  }`}
                >
                  {item.title}
                </p>
                <p className="mt-1.5 text-xs leading-5 text-[#392B56]/50">
                  {item.description}
                </p>
              </a>
            ))}
          </div>
        </Container>
      </div>
    </div>
  );
});

export default ServicesDropdownPanel;

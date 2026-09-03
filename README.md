# Stikkman UX — Coming Soon

A standalone, single-page Next.js app that stands in for the main site
(`../stikkman-revamp`) until launch on **14 Sep 2026**.

It is intentionally self-contained: no CMS, no backend, no `/api` proxy. Every
string lives in `src/app/(ComingSoon)/data/landing.ts`.

## Commands

- `npm run dev` — dev server on http://localhost:3001 (3000 is the main site)
- `npm run build` / `npm run start`
- `npm run lint`

## What is ported from the main site

| Piece | Source |
| --- | --- |
| Header intro animation (`h-dvh` violet splash → 54px bar) | `stikkman-revamp/src/app/shared/Header.tsx` |
| Buttons, `Container`, `HighlightMark` | `stikkman-revamp/src/app/shared/` |
| Optical alignment + vertical text trim | `stikkman-revamp/src/lib/OpticalAlign.ts` + `globals.css` |
| Hero shell (background video + white scrims) | `stikkman-revamp/src/app/(Home)/components/Hero.tsx` |
| Heading reveal (`yPercent 115 → 0`, `back.out(1.6)`) | `stikkman-revamp/src/app/about/components/AnimatedHeroHeading.tsx` |

## Layout: fluid, uncapped

The main site caps content at 1550px and steps type at breakpoints. This app
does neither. Every size is a `max(floor, N vw)` token declared in the
`@theme` block of `src/app/globals.css`, so the page holds identical
proportions from a 360px phone to a 40-inch display instead of stranding a
fixed-width composition in the middle of a large screen.

The `N` factors are set so every token lands on its original fixed size at
**1440px** - the width the design was drawn at - which makes this a strict
generalisation of the previous look rather than a redesign.

| token | 360px | 1440px | 2560px | 3840px |
| --- | --- | --- | --- | --- |
| `text-hero` (h1) | 26 | 69 | 123 | 184 |
| `text-display` (timer) | 20 | 27 | 49 | 73 |
| `text-body` | 14 | 14 | 26 | 38 |
| `text-micro` (mono labels, buttons) | 12 | 12 | 21 | 32 |
| `--spacing-gutter` | 16 | 40 | 71 | 107 |
| `--spacing-bar` (header) | 54 | 54 | 96 | 144 |

Two consequences worth knowing:

- `shared/Container.tsx` has no `max-width` and no `mx-auto` - it is a
  gutter, not a container.
- `--spacing-bar` is duplicated as a JS formula in `shared/Header.tsx`,
  because GSAP tweens a numeric height and cannot read the CSS token. The two
  must change together; a `resize` listener writes the new height back after
  the intro finishes.

Lenis smooth scroll and GSAP ScrollTrigger are **not** included — the page is a
single `h-dvh` viewport with nothing to scroll. Re-add
`SmoothScroll.tsx` + `lib/smoothScroll.ts` + `lib/scrollRefresh.ts` from the
main site if that ever changes.

## Email capture

The two CTAs open a modal that validates one email field and `console.log`s
`{ type, label, email }`. There is no network call yet — wiring that to a real
endpoint is the one remaining task.

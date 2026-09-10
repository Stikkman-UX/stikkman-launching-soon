import Countdown from "@/app/(ComingSoon)/components/Countdown";
import ComingSoonContent from "@/app/(ComingSoon)/components/ComingSoonContent";
import FloatingCards from "@/app/(ComingSoon)/components/FloatingCards";
import FluidContainer from "@/app/(ComingSoon)/components/FluidContainer";
import {
  holdingHeading,
  intro,
  launchDateLabel,
  topBar,
} from "@/app/(ComingSoon)/data/landing";
import { ButtonBlue, ButtonWhite } from "@/app/shared/Button";
import HighlightMark from "@/app/shared/HighlightMark";

/**
 * The holding page — where every unbuilt navigation destination lands
 * (`COMING_SOON_HREF`) and what `not-found.tsx` renders for a URL that isn't
 * here. The landing page at `/` is `LandingSection`, a different
 * composition on purpose: a dead link should read as "not here yet", not as
 * the front door.
 *
 * One centred column on a warm off-white ground — a small status pill, a
 * two-line statement, a line of copy, the countdown as tiles, then the
 * inline deck request — with the studio's numbers floating at the corners as
 * tilted cards and the brand's lavender washed across the background as
 * blurred orbs and one slanted band. Nothing here is the Home hero: no
 * video, no rotator, no left-aligned grid.
 *
 * Laid out as a column of three so it can never scroll: a top bar that keeps
 * its size, the centred stack taking whatever is left with `min-h-0` so it
 * yields rather than pushes, and a spacer matching the top bar's padding. The
 * whole thing is `h-dvh` (not `h-screen`, which on mobile measures the
 * largest viewport and leaves the bottom behind the address bar) and
 * `overflow-hidden`, with the header bar's 54px reserved inside it as
 * `pb-bar` — that bar is `position: fixed`, so nothing else would keep the
 * stack clear of it. The statement and the tile digits use the `-fit`
 * tokens (globals.css), which cap by viewport height as well as width, and
 * the gaps in the stack are in `vh` — together that is what holds this on a
 * short laptop viewport.
 *
 * Entrance: everything is CSS `animate-fade-in-up` with staggered delays,
 * starting at 1.5s — the header splash (0.3s delay + ~1.5s of tweens in
 * `shared/Header.tsx`) has collapsed to its bar by then, so the page writes
 * itself in top to bottom underneath a settled frame.
 */
export default function ComingSoonSection() {
  return (
    <section
      id="hero"
      className="relative flex h-dvh w-full flex-col overflow-hidden bg-[#F7F5F0] pb-bar text-[#392B56]"
    >
      {/* Backdrop. Three orbs: a lavender one up-left, a paler one up-right,
          a warm one low and wide — each a radial gradient blurred far past
          its own edge, so what reaches the eye is colour, not shape. The band
          is the one hard-edged thing, a translucent slab tilted across the
          middle behind the statement; the mask fades its two ends so it
          doesn't terminate in a corner. All inert. */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-[-22vh] left-[-12vw] h-[46vw] w-[46vw] rounded-full opacity-90 blur-[70px]"
          style={{
            background:
              "radial-gradient(circle at 40% 40%, #D9D0FF 0%, rgba(217,208,255,0) 68%)",
          }}
        />
        <div
          className="absolute top-[-10vh] right-[-10vw] h-[38vw] w-[38vw] rounded-full opacity-80 blur-[70px]"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, #EBE3FB 0%, rgba(235,227,251,0) 68%)",
          }}
        />
        <div
          className="absolute bottom-[-28vh] left-[18vw] h-[40vw] w-[64vw] rounded-full opacity-90 blur-[70px]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 60%, #F3EAD8 0%, rgba(243,234,216,0) 68%)",
          }}
        />
        <div
          className="absolute top-[44%] right-[-6vw] left-[-6vw] h-[24vh] -rotate-6 opacity-70 [mask-image:linear-gradient(90deg,transparent,black_14%,black_86%,transparent)]"
          style={{
            background:
              "linear-gradient(90deg, rgba(217,208,255,0.55), rgba(236,231,255,0.28) 45%, rgba(243,234,216,0.45))",
          }}
        />
      </div>

      <FloatingCards />

      {/* Top bar. The return path on the left; on the right the same two
          actions as the landing page, so a visitor who arrived here from a
          dead link still has the front door and a person one click away.
          "Start a conversation" carries `contactCta` — it renders as a
          `data-contact-cta` button that `ComingSoonContent`'s capture-phase
          listener routes into the callback modal (see the note there). */}
      <FluidContainer
        as="header"
        className="animate-fade-in-up relative z-10 flex shrink-0 items-center justify-between gap-fluid-xs py-gutter-y [animation-delay:1.5s]"
      >
        <HighlightMark
          text="Coming soon"
          className="hidden text-[#8A8781] md:block"
          sizeClassName="text-micro tracking-[0.1725em]"
        />
        <div className="flex flex-wrap items-center gap-fluid-2xs">
          {/* `hardNavigate`: a full document load, so the header's intro
              splash plays again on the landing page it returns to. */}
          <ButtonWhite text="Back to home" href="/" withoutIcon hardNavigate />
          <ButtonBlue text="Start a conversation" contactCta />
        </div>
      </FluidContainer>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-[max(10px,1.7vh)] px-gutter text-center">
        <p
          className="animate-fade-in-up inline-flex shrink-0 items-center gap-2 rounded-full border border-[#392B561A] bg-white/70 px-[1.1em] py-[0.45em] font-mono text-micro tracking-[0.1em] text-[#8A8781] uppercase backdrop-blur-sm [animation-delay:1.55s]"
        >
          <span className="relative flex h-[0.55em] w-[0.55em]">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#8E7BE0] opacity-60" />
            <span className="relative inline-flex h-full w-full rounded-full bg-[#8E7BE0]" />
          </span>
          Launching {launchDateLabel}
        </p>

        <h1 className="no-text-trim shrink-0 text-hero-fit font-medium text-[#392B56] [animation-delay:1.65s] animate-fade-in-up">
          <span className="block">{holdingHeading[0]}</span>
          <span className="block text-[#8E7BE0]">{holdingHeading[1]}</span>
        </h1>

        {/* `em` measure so the line keeps ~34 characters at any size, rather
            than growing narrower in proportion as the type scales. */}
        <p className="animate-fade-in-up max-w-[34em] shrink-0 text-body text-[#7B7684] [animation-delay:1.8s]">
          {intro}
        </p>

        {/* A little more air than the stack's own gap on both sides, so the
            tiles read as their own block between the copy and the line. */}
        <div className="animate-fade-in-up my-[max(6px,1.1vh)] shrink-0 [animation-delay:1.95s]">
          <Countdown variant="tiles" />
        </div>

        <p className="animate-fade-in-up shrink-0 font-mono text-nano tracking-[0.172em] text-[#8A8781] uppercase [animation-delay:2.05s]">
          {topBar.right}
          <span className="mx-2 text-[#392B5633]">·</span>
          {topBar.center}
        </p>

        <ComingSoonContent />
      </div>

      {/* Nothing below the stack on purpose: the header bar is the page's
          bottom edge, and the social links are one tap away in its menu. The
          spacer keeps the stack's centring symmetric with the top bar. */}
      <div aria-hidden="true" className="shrink-0 py-gutter-y" />
    </section>
  );
}

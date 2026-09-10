import FluidContainer from "@/app/(ComingSoon)/components/FluidContainer";
import LandingContent from "@/app/(ComingSoon)/components/LandingContent";
import { topBar } from "@/app/(ComingSoon)/data/landing";

/**
 * The page's one section. Structurally a copy of the main site's
 * `(Home)/components/Hero.tsx`: the same background video, the same two white
 * scrims over it, the same top meta bar — the shell the brand is recognised
 * by, with coming-soon content in place of the hero's.
 *
 * Full-bleed: `h-dvh` (not `h-screen`, which measures against the largest
 * mobile viewport and leaves the hero partly behind the address bar) and
 * `w-full` (not `w-screen`, which includes the scrollbar and causes a
 * horizontal scroll). `LandingContent` brings its own `FluidContainer`s, so
 * both of its blocks — the left column and the bottom-right corner — line up
 * with the same fluid gutter as this top bar.
 */
export default function LandingSection() {
  return (
    <section id="hero" className="relative h-dvh w-full overflow-hidden bg-white">
      {/* The desktop framing pushes the video box up and past the right edge
          so the subject sits off-frame right and leaves the left clear for
          the headline. The main site does this with fixed pixels
          (-top-35, -right-75, +110px) tuned at 1440px, which is exactly what
          breaks on a large display: a 300px rightward push is a fifth of a
          1440px screen but a twelfth of a 3840px one, so the subject drifts
          back toward the middle as the viewport grows.

          Expressed as vw instead, the composition is identical at every
          width - and these resolve to exactly -140px / -300px / +110px at
          1440px, so nothing changes at the width it was drawn for.

          The rise and the height delta scale together on purpose. The box
          bottom lands at `100% - (9.72 - 7.64)vw`, i.e. 2.08vw short of the
          section bottom; that gap has to stay hidden behind the header bar,
          which is 3.75vw. Both being vw is what keeps 2.08 < 3.75 true at
          every size rather than only at 1440px.

          Below `lg` none of that framing applies: the box is the plain
          viewport and the crop is centred on the bottom edge, so the subject
          stands on the foot of the screen with the headline stacked above it
          rather than being pushed off to one side. One class covers both the
          phone and the md tablet range. */}
      <video
        className="absolute inset-y-0 right-0 h-full w-full object-cover object-bottom lg:top-[-9.72vw] lg:right-[-20.83vw] lg:h-[calc(100%+7.64vw)] lg:object-right"
        src="/landing/bg-video.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      <div
        style={{ filter: "brightness(1.15)" }}
        className="absolute inset-y-0 left-0 w-full bg-[linear-gradient(to_right,white_15%,transparent)] lg:bg-[linear-gradient(to_right,white_30%,transparent)]"
      />

      <div
        className="absolute inset-y-0 right-0 w-full"
        style={{
          background:
            "radial-gradient(90% 90% at 62% 45%, transparent 38%, white 95%)",
        }}
      />

      <FluidContainer
        as="header"
        className="absolute inset-x-0 top-0 flex items-center justify-between py-gutter-y text-micro font-normal tracking-normal text-[#8A8781]"
      >
        <span>{topBar.left}</span>
        <span className="hidden md:block">{topBar.center}</span>
        <span className="hidden md:block">{topBar.right}</span>
      </FluidContainer>

      <LandingContent />
    </section>
  );
}

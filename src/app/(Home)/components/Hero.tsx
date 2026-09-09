import Container from "@/app/shared/Container";
import HeroHeading from "@/app/(Home)/components/HeroHeading";
import {
  heroBackgroundVideo,
  heroPrimaryCta,
  heroSecondaryCta,
  heroTopBar,
} from "@/app/(Home)/data/hero";
import { pickButton, pickText } from "@/app/(Home)/data/fallback";
import type { HeroContent } from "@/lib/api/types";

export default function Hero({ content }: { content?: HeroContent }) {
  const topBar = {
    left: pickText(content?.topBar?.left, heroTopBar.left),
    center: pickText(content?.topBar?.center, heroTopBar.center),
    right: pickText(content?.topBar?.right, heroTopBar.right),
  };
  const primaryCta = pickButton(content?.primaryCta, heroPrimaryCta);
  const secondaryCta = pickButton(content?.secondaryCta, heroSecondaryCta);

  return (
    <section
      id="hero"
      className="relative h-dvh w-full overflow-hidden bg-white "
    >
      <video
        className="absolute inset-y-0 object-left right-0 h-full w-full object-cover md:object-top-right lg:-right-75 lg:object-right lg:-top-35 lg:h-[calc(100%+110px)] "
        src={heroBackgroundVideo}
        autoPlay
        muted
        loop
        playsInline
      />

      <div
        style={{ filter: "brightness(1.15)" }}
        className="absolute inset-y-0 left-0 w-full bg-[linear-gradient(to_right,white_15%,transparent)] lg:bg-[linear-gradient(to_right,white_30%,transparent)] "
      />

      <div
        className="absolute inset-y-0 right-0 w-full "
        style={{
          background:
            "radial-gradient(90% 90% at 62% 45%, transparent 38%, white 95%)",
        }}
      />

      <Container
        as="header"
        className="absolute inset-x-0 top-0 flex items-center justify-between py-6 text-xs tracking-normal font-normal text-[#8A8781] lg:px-10! xl:px-10! "
      >
        <span>{topBar.left}</span>
        <span className="hidden md:block ">{topBar.center}</span>
        <span className="hidden md:block ">{topBar.right}</span>
      </Container>

      <Container className="absolute inset-0 z-10 flex items-center pb-16 lg:px-10! lg:pt-10 xl:px-10!">
        {/* Server -> client boundary: everything below is a plain
            serializable object. */}
        <HeroHeading primaryCta={primaryCta} secondaryCta={secondaryCta} />
      </Container>
    </section>
  );
}

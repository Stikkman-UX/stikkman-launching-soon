import Container from "@/app/shared/Container";
import HighlightMark from "@/app/shared/HighlightMark";
import RevealSection from "@/app/shared/RevealSection";
import ContentButton from "@/app/shared/ContentButton";
import {
  approachButtons,
  approachEyebrow,
  approachPillars,
  approachStatement,
} from "@/app/(Home)/data/approach";
import { pickList, pickText } from "@/app/(Home)/data/fallback";
import type { WhyUsContent } from "@/lib/api/types";

export default function ApproachSection({
  content,
}: {
  content?: WhyUsContent;
}) {
  return (
    <RevealSection>
    <section className="mt-20 lg:mt-36">
      <Container>
        <div className="relative">
          <div className="absolute -left-6 top-0 hidden h-full lg:block">
            <HighlightMark
              text={pickText(content?.tagName, approachEyebrow)}
              className="text-[#8A8781]"
            />
          </div>

          <div className="mx-auto max-w-217.5">
            <p className="text-2xl leading-snug lg:text-[35px] lg:leading-11 tracking-[-0.53px] font-normal text-[#0A0A0A] ">
              {pickText(content?.mainText, approachStatement)}
            </p>

            <div className="mt-10 grid max-w-3xl grid-cols-1 gap-8 sm:grid-cols-3 lg:mt-12 ">
              {pickList(content?.points, approachPillars).map((pillar) => (
                <div
                  key={pillar.title}
                  className="border-t border-neutral-200 pt-4 transition-colors duration-300 hover:border-neutral-500"
                >
                  <h3 className="text-sm text-[#0A0A0A] lg:text-base font-normal leading-5 ">{pillar.title}</h3>
                  <p className="no-text-trim mt-3 lg:mt-5 text-sm text-[#8A8781] font-normal leading-5 ">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 lg:mt-20 flex items-center gap-3">
              {/* Index keys: the CTAs are a positional list an admin reorders
                  wholesale, and two buttons may legitimately share a label. */}
              {pickList(content?.buttons, approachButtons).map((button, index) => (
                <ContentButton key={index} button={button} />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
    </RevealSection>
  );
}

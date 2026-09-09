import Container from "@/app/shared/Container";
import { designDna, designPrinciples } from "@/app/(Home)/data/designPrinciples";
import HighlightMark from "@/app/shared/HighlightMark";
import RevealSection from "@/app/shared/RevealSection";
import ContentButton from "@/app/shared/ContentButton";
import { pickButton, pickText } from "@/app/(Home)/data/fallback";
import type { DesignDnaContent } from "@/lib/api/types";

export default function DesignDnaSection({
  content,
}: {
  content?: DesignDnaContent;
}) {
  const eyebrow = pickText(content?.tagName, designDna.eyebrow);
  const statement = pickText(content?.description, designDna.statement);
  const cta = pickButton(content?.button, designDna.cta);

  return (
    <RevealSection>
    <section className="overflow-hidden bg-[#FFFCF8] mt-24 py-16 lg:py-22 ">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <HighlightMark text={eyebrow} className="text-[#392B56]" />

          <p className="mt-4 text-2xl lg:mt-8 lg:text-3xl max-w-3xl leading-6.5 font-normal text-[#392B56] lg:leading-11 tracking-[-0.9px] ">
            {statement}
          </p>

          <ContentButton button={cta} className="mt-5 lg:mt-8 " />
        </div>
      </Container>

      <div className="mt-7 overflow-hidden py-5 lg:mt-10 ">
        <div className="flex w-max animate-marquee whitespace-nowrap text-xs font-normal leading-5 text-[#392B56E5] tracking-[2.7px] ">
          {[
            ...designPrinciples,
            ...designPrinciples,
            ...designPrinciples,
            ...designPrinciples,
          ].map((principle, i) => (
            <span key={i} className="flex items-center uppercase">
              {principle}
              <span className="mx-6">/</span>
            </span>
          ))}
        </div>
      </div>
    </section>
    </RevealSection>
  );
}

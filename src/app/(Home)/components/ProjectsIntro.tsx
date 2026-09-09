import Container from "@/app/shared/Container";
import { projectsIntro } from "@/app/(Home)/data/projectsIntro";
import { pickText } from "@/app/(Home)/data/fallback";
import type { ProjectsIntroContent } from "@/lib/api/types";
import HighlightMark from "@/app/shared/HighlightMark";
import RevealSection from "@/app/shared/RevealSection";

export default function ProjectsIntro({
  content,
}: {
  content?: ProjectsIntroContent;
}) {
  return (
    <RevealSection>
    <section className="pt-28 lg:pt-49">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <HighlightMark
            text={pickText(content?.tagName, projectsIntro.eyebrow)}
            className="text-[#8A8781]"
          />
          <p className="mt-4 lg:mt-6 text-lg mx-auto text-normal font-normal opacity-60 tracking-[-0.53px] text-[#0A0A0A] max-w-113.5 ">
            {pickText(content?.description, projectsIntro.body)}
          </p>
          <p className="mt-4 lg:mt-6 text-xs leading-5 text-[#8A8781] font-normal tracking-[2px] ">
            {pickText(content?.footer, projectsIntro.footnote)}
          </p>
        </div>
      </Container>
    </section>
    </RevealSection>
  );
}

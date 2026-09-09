import Container from "@/app/shared/Container";
import CapabilitiesAccordion from "@/app/(Home)/components/CapabilitiesAccordion";
import {
  capabilities,
  capabilitiesEyebrow,
} from "@/app/(Home)/data/capabilities";
import { pickList, pickText } from "@/app/(Home)/data/fallback";
import type { CapabilitiesContent } from "@/lib/api/types";
import HighlightMark from "@/app/shared/HighlightMark";
import RevealSection from "@/app/shared/RevealSection";

export default function CapabilitiesSection({
  content,
}: {
  content?: CapabilitiesContent;
}) {
  return (
    <RevealSection>
    <section className="bg-[#392B56] mt-25 py-12 lg:py-20 ">
      <Container>
        <HighlightMark
          text={pickText(content?.eyebrow, capabilitiesEyebrow)}
          invert
          className="text-center text-[#F8F8F8]"
        />

        <div className="mx-auto mt-8 lg:mt-16.5 max-w-[934px]">
          <CapabilitiesAccordion
            capabilities={pickList(content?.items, capabilities)}
          />
        </div>
      </Container>
    </section>
    </RevealSection>
  );
}

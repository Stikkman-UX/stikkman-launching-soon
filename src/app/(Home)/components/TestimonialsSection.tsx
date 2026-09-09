import Container from "@/app/shared/Container";
import TestimonialsCarousel from "@/app/(Home)/components/TestimonialsCarousel";
import RevealSection from "@/app/shared/RevealSection";
import { pickList } from "@/app/(Home)/data/fallback";
import { testimonials } from "@/app/(Home)/data/testimonials";
import type { TestimonialsContent } from "@/lib/api/types";

export default function TestimonialsSection({
  content,
}: {
  content?: TestimonialsContent;
}) {
  return (
    <RevealSection>
    <section className="overflow-hidden pt-24 lg:pt-32">
      <Container>
        {/* `pickList` is load-bearing here, not just cosmetic: the carousel
            divides by `testimonials.length` to work out how many times to
            repeat the slides, so an empty array would throw a RangeError and
            crash the whole page. */}
        <TestimonialsCarousel
          testimonials={pickList(content?.items, testimonials)}
        />
      </Container>
    </section>
    </RevealSection>
  );
}

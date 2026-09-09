import Container from "@/app/shared/Container";
import {
  articles,
  insightsCta,
  insightsEyebrow,
} from "@/app/(Home)/data/articles";
import HighlightMark from "@/app/shared/HighlightMark";
import RevealSection from "@/app/shared/RevealSection";
import ContentButton from "@/app/shared/ContentButton";
import { pickButton, pickList, pickText } from "@/app/(Home)/data/fallback";
import type { InsightsContent } from "@/lib/api/types";

// The staggered card heights that give the row its rhythm — index 0 shortest,
// index 1 tallest, and so on. Applied modulo the list length so an admin
// adding a fifth article starts the same four-step pattern again on the next
// row instead of dropping to an unset height.
const CARD_HEIGHTS_XL = ["xl:h-[235px]", "xl:h-[359px]", "xl:h-[275px]", "xl:h-[330px]"];

export default function InsightsSection({
  content,
}: {
  content?: InsightsContent;
}) {
  const eyebrow = pickText(content?.tagName, insightsEyebrow);
  const cta = pickButton(content?.button, insightsCta);
  const items = pickList(content?.items, articles);

  return (
    <RevealSection>
    <section className="mt-12 pb-14 lg:mt-20 lg:pb-22">
      <Container>
        <div className="flex items-center justify-between">
          <HighlightMark text={eyebrow} className="text-[#8A8781]" />

          <ContentButton button={cta} />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((article, index) => (
            <article key={article.slug}>
              <div
                className={`aspect-4/3 w-full rounded-sm bg-cover bg-center bg-neutral-100 xl:aspect-auto ${
                  CARD_HEIGHTS_XL[index % CARD_HEIGHTS_XL.length]
                }`}
                // An article whose image an admin hasn't uploaded yet keeps the
                // neutral placeholder — `url()` with an empty value is invalid
                // CSS and would drop the whole declaration anyway.
                style={
                  article.image
                    ? { backgroundImage: `url(${article.image})` }
                    : undefined
                }
              />

              <div className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-wider text-neutral-400">
                <span className="rounded-full border border-neutral-200 px-2.5 py-1">
                  {article.category}
                </span>
                <span>{article.date}</span>
                <span>&middot;</span>
                <span>{article.readTime}</span>
              </div>

              <h3 className="mt-3 text-lg leading-6 font-normal text-[#0A0A0A] ">
                {article.title}
              </h3>

              <p className="mt-4.5 text-sm font-normal text-[#8A8781] leading-5 ">
                {article.excerpt}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
    </RevealSection>
  );
}

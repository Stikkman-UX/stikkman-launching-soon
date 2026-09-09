import Container from "@/app/shared/Container";
import ProjectCard from "@/app/(Home)/components/ProjectCard";
import type { Project } from "@/app/(Home)/data/projects";
import HighlightMark from "@/app/shared/HighlightMark";
import RevealSection from "@/app/shared/RevealSection";

// Rendered twice on Home with a different `tagName` each time, so the label is
// resolved by the caller (its two CMS sections are separate) rather than read
// from static data here.
export default function ProjectsList({
  projects,
  tagName,
}: {
  projects: Project[];
  tagName: string;
}) {
  return (
    <RevealSection>
    <section className="pt-20 lg:pt-30">
      <Container>
        <div className="relative">
          <div className="absolute -left-6 top-0 hidden h-full lg:block">
            <HighlightMark
              text={tagName}
              className="sticky top-70 text-[#8A8781]"
            />
          </div>

          <div className="mx-auto flex max-w-[850px] flex-col gap-14 md:gap-22 lg:gap-40">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </Container>
    </section>
    </RevealSection>
  );
}

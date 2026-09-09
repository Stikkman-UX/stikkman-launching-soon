import Hero from "@/app/(Home)/components/Hero";
import ProjectsIntro from "@/app/(Home)/components/ProjectsIntro";
import ProjectsList from "@/app/(Home)/components/ProjectsList";
import DesignDnaSection from "@/app/(Home)/components/DesignDnaSection";
import ApproachSection from "@/app/(Home)/components/ApproachSection";
import CapabilitiesSection from "@/app/(Home)/components/CapabilitiesSection";
import TestimonialsSection from "@/app/(Home)/components/TestimonialsSection";
import InsightsSection from "@/app/(Home)/components/InsightsSection";
import Footer from "@/app/shared/Footer";
import {
  projectsPartOne as fallbackProjectsPartOne,
  projectsPartTwo as fallbackProjectsPartTwo,
  type Project,
} from "@/app/(Home)/data/projects";
import { projectsIntro } from "@/app/(Home)/data/projectsIntro";
import { pickText } from "@/app/(Home)/data/fallback";
import { getPageContent } from "@/lib/api/pages";
import { getHomeProjects } from "@/lib/api/projects";
import type { HomePageContent } from "@/lib/api/types";

/**
 * Per root CLAUDE.md rule 5: public pages must keep working even if the CMS
 * is unavailable. Each section falls back to its static array independently
 * — an empty/errored section never blanks out the whole Projects area, and
 * a partial backend outage can't take down a section that has live data.
 */
async function resolveHomeProjects(): Promise<{
  projectsPartOne: Project[];
  projectsPartTwo: Project[];
}> {
  try {
    const { partOne, partTwo } = await getHomeProjects();

    return {
      projectsPartOne: partOne.length > 0 ? partOne : fallbackProjectsPartOne,
      projectsPartTwo: partTwo.length > 0 ? partTwo : fallbackProjectsPartTwo,
    };
  } catch (error) {
    console.error(
      "[Home] getHomeProjects failed, falling back to static projects:",
      error
    );

    return {
      projectsPartOne: fallbackProjectsPartOne,
      projectsPartTwo: fallbackProjectsPartTwo,
    };
  }
}

/**
 * The CMS-backed half of the page. Unpublished and never-configured sections
 * come back as absent keys, so an empty object is a perfectly valid result —
 * every section then falls back to its static copy on its own, per-field.
 */
async function resolveHomeContent(): Promise<HomePageContent> {
  try {
    return await getPageContent("home");
  } catch (error) {
    console.error(
      "[Home] getPageContent failed, falling back to static content:",
      error
    );

    return {};
  }
}

export default async function Home() {
  const [{ projectsPartOne, projectsPartTwo }, content] = await Promise.all([
    resolveHomeProjects(),
    resolveHomeContent(),
  ]);

  return (
    <>
    <main className="w-full overflow-x-clip">
      <Hero content={content.hero} />

      <ProjectsIntro content={content.projectsIntro} />

      <div className="lg:mt-19 ">
        <ProjectsList
          projects={projectsPartOne}
          tagName={pickText(
            content.projectsOneTag?.tagName,
            projectsIntro.selectedWorksLabel
          )}
        />
      </div>

      <ApproachSection content={content.whyUs} />

      <div className="lg:mt-10 ">
        <ProjectsList
          projects={projectsPartTwo}
          tagName={pickText(
            content.projectsTwoTag?.tagName,
            projectsIntro.selectedWorksLabel
          )}
        />
      </div>

      <CapabilitiesSection content={content.capabilities} />

      <TestimonialsSection content={content.testimonials} />

      <DesignDnaSection content={content.designDna} />

      <InsightsSection content={content.insights} />
    </main>

    <Footer />
    </>
  );
}

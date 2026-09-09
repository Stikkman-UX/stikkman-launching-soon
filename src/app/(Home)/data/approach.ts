import type { CmsButton } from "@/lib/api/types";
import { CONTACT_HREF } from "@/lib/contactCta";

export type ApproachPillar = {
  title: string;
  description: string;
};

export const approachEyebrow = "WHY US";

export const approachStatement =
  "Transforming UX isn't about making products look better—it's about making them work better. We rethink every interaction to reduce friction, improve usability, and create experiences that drive measurable business outcomes.";

export const approachPillars: ApproachPillar[] = [
  {
    title: "Reduce user friction",
    description:
      "Small, senior teams embedded with yours — no handoffs, no juniors learning on your budget.",
  },
  {
    title: "Enable scalable growth",
    description:
      "Restraint over noise. We measure success by how invisible the final result feels.",
  },
  {
    title: "Improve conversion paths",
    description:
      "Ambitious founders, growth-stage products, and established brands ready to evolve.",
  },
];

// `CONTACT_HREF` is the site-wide opt-in for "scroll to the footer form and
// focus it" — `shared/Button.tsx` treats that href as a contact CTA on its
// own, no extra flag needed.
export const approachButtons: CmsButton[] = [
  { text: "Start a project", color: "blue", href: CONTACT_HREF, contactCta: true },
  { text: "Start a project", color: "white", href: CONTACT_HREF, contactCta: true },
];

export type Capability = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
};

// Lifted out of `CapabilitiesSection.tsx`; mirrors the backend's
// `home.capabilities` registry default — see the note in `hero.ts`.
export const capabilitiesEyebrow = "CAPABILITIES";

export const capabilities: Capability[] = [
  {
    slug: "research-strategy",
    title: "Research & Strategy",
    description:
      "Discovery workshops, user interviews, journey mapping, and product strategy that turns ambiguity into a clear direction the whole team can rally behind.",
    tags: ["Discovery", "User Interviews", "Journeys", "Positioning"],
  },
  {
    slug: "product-interface",
    title: "Product & Interface",
    description:
      "End-to-end product design across web and native, from wireframes to pixel-accurate UI, backed by usability testing at every stage.",
    tags: ["Wireframing", "UI Design", "Usability Testing"],
  },
  {
    slug: "design-systems",
    title: "Design Systems",
    description:
      "Scalable component libraries and documentation that keep design and engineering in lockstep as the product grows.",
    tags: ["Components", "Tokens", "Documentation"],
  },
  {
    slug: "brand-identity",
    title: "Brand & Identity",
    description:
      "Visual identity, typography, and motion language that give a product a distinct, memorable voice.",
    tags: ["Identity", "Typography", "Motion"],
  },
];

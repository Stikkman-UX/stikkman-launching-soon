export type TestimonialMedia = {
  url: string;
  type: "image" | "video";
};

export type Testimonial = {
  slug: string;
  quote: string;
  author: string;
  role: string;
  avatar: string;
  media: TestimonialMedia;
};

export const testimonials: Testimonial[] = [
  {
    slug: "elena-fischer",
    quote:
      "StikkmanUX reframed our team's clarity. In six weeks, our activation rate doubled.",
    author: "Elena Fischer",
    role: "Co-founder & CEO, Garuda",
    avatar: "/landing/project/image-1.png",
    media: { url: "/landing/project/image-2.png", type: "image" },
  },
  {
    slug: "marcus-lee",
    quote:
      "The design system they built us cut our shipping time in half and finally got engineering and design speaking the same language.",
    author: "Marcus Lee",
    role: "VP Product, Atlas CRM",
    avatar: "/landing/project/image-3.png",
    media: { url: "/landing/project/image-4.png", type: "image" },
  },
  {
    slug: "priya-nair",
    quote:
      "Quietly premium is exactly right. Every screen feels considered, and our users noticed immediately.",
    author: "Priya Nair",
    role: "Head of Design, North Star",
    avatar: "/landing/project/image-2.png",
    media: { url: "/landing/project/image-1.png", type: "image" },
  },
];

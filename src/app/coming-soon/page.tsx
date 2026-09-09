import type { Metadata } from "next";
import ComingSoonSection from "@/app/(ComingSoon)/components/ComingSoonSection";

export const metadata: Metadata = {
  title: "Coming soon | Stikkman UX",
  description:
    "This part of the Stikkman UX experience is on its way. Request our company deck or start a conversation in the meantime.",
};

/**
 * One full-screen composition and nothing else — no Footer, deliberately. The
 * section is `h-dvh` and pins the countdown to the bottom-right corner, so
 * anything after it would put a scrollbar on a page whose whole point is that
 * it is a single frame. Both of its CTAs open a request modal, so the
 * footer's contact form isn't the destination it used to be either.
 */
export default function ComingSoonPage() {
  return (
    <main className="w-full overflow-x-clip">
      <ComingSoonSection />
    </main>
  );
}

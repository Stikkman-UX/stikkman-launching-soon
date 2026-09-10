import ComingSoonSection from "@/app/(ComingSoon)/components/ComingSoonSection";

/**
 * The landing page is the Coming Soon frame again. The full Home page is
 * still built and still served — it moved to `/home` (see `home/page.tsx`)
 * rather than being deleted, so it stays reviewable while the site holds.
 *
 * Same composition as `/coming-soon`, which is kept as its own URL because
 * every unbuilt navigation destination points there (`COMING_SOON_HREF`).
 * No metadata override here on purpose: the root layout's title and Open
 * Graph card are the ones that should describe the origin root when the URL
 * is shared. Footer-less for the reason spelled out in `/coming-soon`.
 */
export default function Home() {
  return (
    <main className="w-full overflow-x-clip">
      <ComingSoonSection />
    </main>
  );
}

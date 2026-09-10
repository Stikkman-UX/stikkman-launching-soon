import LandingSection from "@/app/(ComingSoon)/components/LandingSection";

/**
 * The landing page: the brand hero's shell (video sphere, white scrims, meta
 * bar) carrying the launch statement and countdown. The full Home page is
 * still built and still served — it moved to `/home` (see `home/page.tsx`)
 * rather than being deleted, so it stays reviewable while the site holds.
 *
 * Deliberately not the same composition as `/coming-soon`: that is the
 * holding page every unbuilt navigation destination lands on
 * (`COMING_SOON_HREF`), and it has its own darker frame so a dead link reads
 * as "not here yet" rather than bouncing back to the front door.
 * No metadata override here on purpose: the root layout's title and Open
 * Graph card are the ones that should describe the origin root when the URL
 * is shared. Footer-less for the reason spelled out in `/coming-soon`.
 */
export default function Home() {
  return (
    <main className="w-full overflow-x-clip">
      <LandingSection />
    </main>
  );
}

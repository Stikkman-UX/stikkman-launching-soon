import ComingSoonSection from "@/app/(ComingSoon)/components/ComingSoonSection";

/**
 * Only the Home page is built on this site (at `/home` — `/` holds the same
 * Coming Soon frame this renders), so a URL that doesn't resolve is
 * almost always a page that simply isn't here yet (a CMS-authored
 * `/work/[slug]` href, say) rather than a genuine mistake — it gets the same
 * Coming Soon treatment as the links that point there deliberately.
 *
 * Rendered by Next for any unmatched route, keeping the real 404 status
 * rather than redirecting a URL that may yet become a real page. Footer-less
 * for the same reason as `/coming-soon` itself — see the note there.
 */
export default function NotFound() {
  return (
    <main className="w-full overflow-x-clip">
      <ComingSoonSection />
    </main>
  );
}

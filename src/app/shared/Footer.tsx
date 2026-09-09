import Container from "@/app/shared/Container";
import LocalTime from "@/app/(Home)/components/LocalTime";
import HighlightMark from "@/app/shared/HighlightMark";
import ContactForm from "@/app/shared/ContactForm";
import { pickList } from "@/app/(Home)/data/fallback";
import { socialLinksFallback } from "@/app/shared/data/navigationFallback";
import { getPublicNavigation } from "@/lib/api/navigation";
import { CONTACT_SECTION_ID } from "@/lib/contactCta";

/**
 * Server-only, self-fetching: `Footer` is imported independently by many
 * pages/layouts (not just the root layout), so it reads its own slice of
 * Navigation rather than needing every call site to thread a prop through.
 * Deduped against `layout.tsx`'s own `getPublicNavigation()` call within the
 * same request by Next's built-in fetch memoization (both go through
 * `serverPublicFetch` with the same URL/init). Falls back to `{}` on error,
 * same Rule-5 shape as `page.tsx`'s `resolveHomeContent`.
 */
async function resolveSocialLinks() {
  try {
    const content = await getPublicNavigation();
    return pickList(content.socialLinks?.items, socialLinksFallback);
  } catch (error) {
    console.error(
      "[Footer] getPublicNavigation failed, falling back to static social links:",
      error
    );
    return socialLinksFallback;
  }
}

export default async function Footer() {
  const social = await resolveSocialLinks();

  return (
    // `id` is the scroll target for every "start a project" CTA on the site —
    // see `lib/contactCta.ts`. Also makes a plain `#contact` link work with
    // no JS at all.
    <footer id={CONTACT_SECTION_ID} className="relative z-[60] bg-[#392B56] pb-10 ">
      <Container>
        <div className="grid grid-cols-1 gap-12 border-b border-white/10 py-9 lg:grid-cols-2 lg:gap-12 lg:py-12 lg:pt-15 lg:justify-between ">
          <div>
            <HighlightMark text="LETS BUILD" className="text-white" invert />

            <h2 className="mt-6 text-4xl leading-tight text-white/60 sm:text-5xl xl:text-[88px] xl:leading-[90px] tracking-[-2.64px] ">
              Have an idea
              <br />
              worth <span className="text-white">making?</span>
            </h2>

            <a
              href="mailto:hello@stikkmanux.com"
              className="mt-8 inline-block text-sm tracking-wide text-white/60 transition-colors hover:text-white"
            >
              hello@stikkmanux.com
            </a>
          </div>

          <div className="w-full xl:w-[550px] xl:justify-self-end ">
            <p className="text-xs tracking-widest font-mono text-white/40">
              START A CONVERSATION
            </p>

            <ContactForm />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 py-12 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs tracking-widest text-white/40">STUDIO</p>
            <address className="mt-4 not-italic leading-relaxed text-white/60">
              Cinnabar Hills, Embassy Golf Links
              <br />
              Business Park,
              <br />
              Bengaluru, Karnataka
            </address>
          </div>

          <div>
            <p className="text-xs tracking-widest text-white/40">SOCIAL</p>
            <ul className="mt-4 flex flex-col gap-2">
              {social.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-white/60 transition-colors hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs tracking-widest text-white/40">LOCAL TIME</p>
            <p className="mt-4 text-white/60">
              <LocalTime timeZone="Asia/Kolkata" />
            </p>
          </div>
        </div>

        <div className="mt-20 lg:mt-28 md:flex justify-between items-center font-mono text-xs font-normal text-white/40 leading-4 tracking-[2px]">
          <p className="uppercase ">© 2026 StikkmanUx — All rights reserved</p>

          <p>Designed & built in-house</p>
        </div>
      </Container>
    </footer>
  );
}

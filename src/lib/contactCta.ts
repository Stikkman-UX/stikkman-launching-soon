import { scrollToElement } from "@/lib/smoothScroll";

/**
 * "Take me to the contact form" behaviour, shared by every CTA that offers it.
 *
 * Opting in is declarative rather than per-component wiring: point a link at
 * `CONTACT_HREF` (`#contact`) or put `data-contact-cta` on a button, and the
 * delegated listener in `shared/ContactCtaListener.tsx` picks it up. That's
 * what lets CMS-authored CTAs — whose `href` an admin types into the admin
 * panel, with no chance to attach a handler — use it too.
 *
 * `Footer` is imported per-page rather than from the root layout, so the
 * anchor genuinely may not exist on the current route. Everything here is
 * built around that: nothing throws, and the caller is told whether it
 * happened so it can leave the browser's own behaviour alone if it didn't.
 */

export const CONTACT_SECTION_ID = "contact";
export const CONTACT_FIRST_FIELD_ID = "contact-name";
export const CONTACT_HREF = `#${CONTACT_SECTION_ID}`;

/**
 * Glides to the footer and drops the caret in the form's first field.
 * Returns false when this page has no contact form, so the caller can fall
 * back to normal link handling instead of swallowing the click.
 */
export function scrollToContactForm(): boolean {
  const section = document.getElementById(CONTACT_SECTION_ID);
  if (!section) return false;

  scrollToElement(section, {
    onComplete: () => {
      const field = document.getElementById(CONTACT_FIRST_FIELD_ID);
      // `preventScroll` because the scroll has already landed. Focusing
      // normally makes the browser scroll the field into view itself, which
      // both undoes the offset we just animated to and desyncs Lenis — it
      // tracks its own scroll target and doesn't know about native jumps.
      field?.focus({ preventScroll: true });
    },
  });

  return true;
}

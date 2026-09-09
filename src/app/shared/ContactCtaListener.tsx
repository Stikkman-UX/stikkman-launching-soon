"use client";

import { useEffect } from "react";
import { CONTACT_HREF, scrollToContactForm } from "@/lib/contactCta";

/**
 * One delegated click listener for every contact CTA on the site, mounted
 * once from the root layout.
 *
 * Delegation rather than an onClick per button because the CTAs that most
 * need this are CMS-authored — an admin types an `href` into the admin panel
 * and there's no component to hang a handler on. Anything matching
 * `href="#contact"` (or a `data-contact-cta` button) gets the behaviour for
 * free, wherever it renders.
 */
export default function ContactCtaListener() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      // Leave anything already handled, and any click the user meant as
      // "open elsewhere" (middle-click, cmd/ctrl-click), to the browser.
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const trigger = (event.target as Element | null)?.closest?.(
        `a[href*="${CONTACT_HREF}"], [data-contact-cta]`,
      );
      if (!trigger) return;

      if (trigger instanceof HTMLAnchorElement) {
        // `a.href` resolves to an absolute URL, so this compares like with
        // like. A CTA pointing at *another* page's form ("/#contact" from
        // /sectors/fintech) has to navigate there first — scrolling to the
        // footer we happen to be standing next to would be the wrong page.
        // The hash check keeps a near-miss like "#contact-details" out.
        const url = new URL(trigger.href, window.location.href);
        if (
          url.origin !== window.location.origin ||
          url.pathname !== window.location.pathname ||
          url.hash !== CONTACT_HREF
        ) {
          return;
        }
      }

      // Only take over the click if this page actually has the form —
      // otherwise let the link navigate as authored.
      if (scrollToContactForm()) event.preventDefault();
    }

    // Capture phase, deliberately. React dispatches its synthetic onClick
    // when the event reaches the root container in the *bubble* phase, so a
    // bubble listener here runs after `next/link`'s own handler has already
    // called preventDefault and pushed the hash route — and the guard above
    // would then bail out every single time. The visible symptom was a CTA
    // that "worked once": the first click was Next's plain hash jump, and
    // every click after it was a no-op because the URL hash hadn't changed.
    // Capturing puts us first, and `next/link` skips navigating when the
    // event is already default-prevented.
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}

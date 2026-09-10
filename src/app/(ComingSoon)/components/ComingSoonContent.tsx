"use client";

import { useEffect, useRef, useState } from "react";
import { ButtonBlue } from "@/app/shared/Button";
import SuccessCheckIcon from "@/app/shared/SuccessCheckIcon";
import RequestModal from "@/app/(ComingSoon)/components/RequestModal";
import { CONTACT_HREF } from "@/lib/contactCta";
import { validateEmail } from "@/lib/email";
import { SHEET_HEADERS, submitToSheet } from "@/lib/formSubmission";
import {
  contactEmail,
  deckNote,
  requestCtas,
  type RequestCta,
} from "@/app/(ComingSoon)/data/landing";

/**
 * The holding page's interactive part: the inline deck request, the link
 * into the callback modal, and the modal itself.
 *
 * The inline form is the modal's "Request company deck" flattened onto the
 * page — same one field, same validation (`lib/email.ts`), same sheet tab
 * (`requestCtas.deck.sheet`) and the same `Request` column value, so a row
 * from here is indistinguishable from one sent through the modal and the
 * Apps Script sends the same confirmation. Validation runs on submit and
 * only then live, so an address is never flagged while it is still being
 * typed. A failed send keeps the address in the field and says so.
 *
 * The callback request stays a modal: it is the main site's whole contact
 * form and has no business inline on a page that must fit one screen.
 */
export default function ComingSoonContent() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);
  const [isSent, setIsSent] = useState(false);

  const [request, setRequest] = useState<RequestCta | null>(null);
  // Captured when the modal opens so focus can go back where it came from on
  // close. Reading `document.activeElement` at that moment is enough — the
  // control that opened it is the focused element.
  const triggerRef = useRef<HTMLElement | null>(null);

  // The site header is global and carries a “let’s talk” CTA that opts into
  // the scroll-to-the-footer-form behaviour by marking itself
  // `data-contact-cta` (see `lib/contactCta.ts`); so does the top bar's
  // "Start a conversation" on this page. This page has no footer — it is one
  // full screen — so `ContactCtaListener` finds no `#contact` anchor, leaves
  // the click alone, and a button CTA then does nothing at all.
  //
  // Route it into this page’s own callback request instead, which asks for
  // exactly what the footer form asks for. Capture phase and the same guards
  // as that listener, so the two agree on which clicks count as a contact CTA.
  useEffect(() => {
    function handleContactCta(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const trigger = (event.target as Element | null)?.closest?.(
        `a[href*="${CONTACT_HREF}"], [data-contact-cta]`,
      );
      if (!trigger) return;

      event.preventDefault();
      openRequest(
        requestCtas.caseStudy,
        trigger instanceof HTMLElement ? trigger : null,
      );
    }

    document.addEventListener("click", handleContactCta, true);
    return () => document.removeEventListener("click", handleContactCta, true);
  }, []);

  function openRequest(cta: RequestCta, trigger?: HTMLElement | null) {
    triggerRef.current =
      trigger ??
      (document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null);
    setRequest(cta);
  }

  function closeRequest() {
    setRequest(null);

    const trigger = triggerRef.current;
    triggerRef.current = null;
    if (trigger?.isConnected) trigger.focus();
  }

  function handleChange(value: string) {
    setEmail(value);
    if (hasSubmitted) setError(validateEmail(value));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextError = validateEmail(email);
    setError(nextError);
    setHasSubmitted(true);
    setSubmitError(undefined);

    if (nextError) return;

    setIsSending(true);

    try {
      await submitToSheet(requestCtas.deck.sheet, {
        [SHEET_HEADERS.email]: email.trim(),
        [SHEET_HEADERS.request]: requestCtas.deck.label,
      });

      setIsSent(true);
    } catch (submitFailure) {
      console.error("[request] submission failed", submitFailure);
      setSubmitError(
        `Something went wrong sending that. Please try again, or email us at ${contactEmail}.`,
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <div className="animate-fade-in-up flex w-full max-w-[max(420px,29vw)] shrink-0 flex-col items-center gap-[max(8px,1.2vh)] [animation-delay:2.2s]">
        {isSent ? (
          // Same height as the form row, so the stack doesn't jump.
          <div className="flex min-h-11 items-center gap-3 text-left">
            <SuccessCheckIcon
              className="h-9 w-9 shrink-0 bg-[#392B56]"
              iconClassName="h-4 w-4 text-white"
            />
            <p className="animate-fade-in-up text-body text-[#392B56]">
              Thanks — the deck is on its way to {email.trim()}.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex w-full flex-col gap-[max(6px,0.8vh)]"
          >
            {/* The field and the button share one pill: a white capsule with
                the button flush against its right end, the way the reference
                sets its "Notify me". Focus is shown on the capsule, not the
                bare input, so the ring follows the visible shape. */}
            <div
              className={`flex w-full items-center rounded-full border bg-white/85 p-1 pl-[1.2em] text-body shadow-[0_14px_32px_-20px_rgba(57,43,86,0.45)] backdrop-blur-sm transition-colors focus-within:bg-white ${
                error ? "border-red-400" : "border-[#392B561A] focus-within:border-[#392B5640]"
              }`}
            >
              <label htmlFor="deck-email" className="sr-only">
                Your email
              </label>
              <input
                id="deck-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Your email"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "deck-email-error" : undefined}
                value={email}
                disabled={isSending}
                onChange={(event) => handleChange(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-[#392B56] outline-none placeholder-[#00000066] disabled:cursor-not-allowed disabled:opacity-50"
              />
              <ButtonBlue
                text="Get the deck"
                type="submit"
                loading={isSending}
                className="h-9! shrink-0 px-5!"
              />
            </div>

            {error && (
              <p id="deck-email-error" className="text-micro text-red-500">
                {error}
              </p>
            )}
            {submitError && (
              <p role="alert" className="text-micro text-red-500">
                {submitError}
              </p>
            )}
          </form>
        )}

        <p className="text-micro text-[#8A8781]">
          {deckNote}{" "}
          <button
            type="button"
            onClick={() => openRequest(requestCtas.caseStudy)}
            className="cursor-pointer text-[#392B56] underline decoration-[#392B5640] underline-offset-[0.2em] transition-colors hover:decoration-[#392B56]"
          >
            Or start a conversation
          </button>
        </p>
      </div>

      <RequestModal request={request} onClose={closeRequest} />
    </>
  );
}

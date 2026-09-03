"use client";

import { ReactNode, useEffect, useId, useRef, useState } from "react";
import HighlightMark from "@/app/shared/HighlightMark";
import SuccessCheckIcon from "@/app/shared/SuccessCheckIcon";
import { ButtonBlue } from "@/app/shared/Button";
import ContactRequestForm from "@/app/(ComingSoon)/components/ContactRequestForm";
import { useEscapeKey } from "@/lib/useEscapeKey";
import type { RequestCta } from "@/app/(ComingSoon)/data/landing";

// The same pattern the main site's contact forms validate against, kept
// identical so an address accepted here is accepted there too.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SUCCESS_DURATION_MS = 2500;

function validateEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === "") return "Email is required";
  if (!EMAIL_PATTERN.test(trimmed)) return "Enter a valid email address";
  return undefined;
}

/**
 * Backdrop, panel and close button — the chrome both request variants share.
 *
 * It deliberately does *not* bind Escape: each variant's body owns that key,
 * because the contact form has a dropdown Escape must close before the modal
 * (see `useEscapeKey`'s note on why two racing listeners wouldn't work).
 *
 * The panel scales with the viewport like everything else. `maxWidth` is the
 * variant's width at 1440px expressed as vw, with a floor so it stays
 * readable on a phone (where the `w-full` and the wrapper's gutter cap it
 * anyway).
 */
function ModalShell({
  titleId,
  maxWidthClassName,
  onClose,
  children,
}: {
  titleId: string;
  maxWidthClassName: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-gutter">
      <div
        aria-hidden="true"
        onMouseDown={onClose}
        className="animate-fade-in absolute inset-0 bg-[#392B56]/40 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`animate-fade-in-up no-scrollbar relative max-h-full w-full overflow-y-auto rounded-2xl border border-[#392B561F] bg-white p-fluid-md ${maxWidthClassName}`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-fluid-sm right-fluid-sm cursor-pointer text-[#8A8781] transition-colors duration-200 hover:text-[#392B56]"
        >
          <svg
            className="h-[max(16px,1.1vw)] w-[max(16px,1.1vw)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>

        {children}
      </div>
    </div>
  );
}

/**
 * Email capture — the deck request's whole ask.
 *
 * Nothing is sent anywhere yet — a valid submission is logged to the console
 * and the panel switches to its success state. Wiring this to a real endpoint
 * is the one deliberate gap.
 */
function EmailRequestForm({
  request,
  titleId,
  onClose,
}: {
  request: RequestCta;
  titleId: string;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEscapeKey(onClose);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  function handleChange(value: string) {
    setEmail(value);
    // Only re-check live once a submit has already failed — flagging an
    // address as invalid while it is still being typed is just noise.
    if (hasSubmitted) setError(validateEmail(value));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextError = validateEmail(email);
    setError(nextError);
    setHasSubmitted(true);
    if (nextError) return;

    console.log("[request]", {
      type: request.id,
      label: request.label,
      email: email.trim(),
    });

    setIsSent(true);
    closeTimeoutRef.current = setTimeout(onClose, SUCCESS_DURATION_MS);
  }

  if (isSent) {
    return (
      <div className="flex min-h-[16em] flex-col items-center justify-center gap-fluid-sm text-center">
        <SuccessCheckIcon />
        <div className="animate-fade-in-up flex flex-col gap-fluid-2xs">
          <p
            id={titleId}
            className="text-[max(18px,1.4vw)] leading-tight text-[#392B56]"
          >
            Thanks — you&apos;re on the list.
          </p>
          <p className="max-w-[26em] text-body text-[#8A8781]">
            We&apos;ll send it across to {email.trim()} shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <HighlightMark text="Request" className="text-[#8A8781]" />

      <h2
        id={titleId}
        className="mt-fluid-xs text-[max(20px,1.67vw)] leading-tight tracking-[-0.033em] text-[#392B56]"
      >
        {request.label}
      </h2>

      <p className="mt-fluid-xs text-body text-[#8A8781]">
        {request.description}
      </p>

      <form className="mt-fluid-md" onSubmit={handleSubmit} noValidate>
        {/* `em` padding so the field grows with its own type rather than
            becoming a thin strip inside a scaled-up panel. At the 14px
            floor these are the main site's `px-4 py-3.5`. */}
        <input
          ref={inputRef}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="/ Email *"
          aria-invalid={Boolean(error)}
          value={email}
          onChange={(event) => handleChange(event.target.value)}
          className={`w-full rounded-lg border bg-[#0000000A] px-[1.15em] py-[1em] text-body text-[#392B56] outline-none transition-colors placeholder-[#00000066] focus:bg-[#EFEDE9] ${
            error ? "border-red-500" : "border-transparent"
          }`}
        />

        {error && <p className="mt-fluid-2xs text-micro text-red-500">{error}</p>}

        <ButtonBlue text="Send it over" type="submit" className="mt-fluid-xs" />
      </form>
    </>
  );
}

/**
 * Keyed on `request.id` by the wrapper below, so every open starts from a
 * clean field/error/status rather than whatever the last one left behind.
 *
 * Which body is rendered is the CTA's own `variant` (see `data/landing.ts`):
 * `"email"` is the one-field capture above, `"contact"` is the main site's
 * public Contact page form, ported wholesale in `ContactRequestForm`. Its
 * `max-w` is that page's form column at 1440px (a 1152px content width split
 * into two `gap-16` columns = 544px), the email panel's is the 480px it has
 * always been.
 */
function RequestModalPanel({
  request,
  onClose,
}: {
  request: RequestCta;
  onClose: () => void;
}) {
  const titleId = useId();
  const isContact = request.variant === "contact";

  return (
    <ModalShell
      titleId={titleId}
      maxWidthClassName={
        isContact ? "max-w-[max(544px,37.8vw)]" : "max-w-[max(480px,33vw)]"
      }
      onClose={onClose}
    >
      {isContact ? (
        <ContactRequestForm
          titleId={titleId}
          title={request.label}
          description={request.description}
          onClose={onClose}
        />
      ) : (
        <EmailRequestForm
          request={request}
          titleId={titleId}
          onClose={onClose}
        />
      )}
    </ModalShell>
  );
}

export default function RequestModal({
  request,
  onClose,
}: {
  request: RequestCta | null;
  onClose: () => void;
}) {
  if (!request) return null;

  return (
    <RequestModalPanel key={request.id} request={request} onClose={onClose} />
  );
}

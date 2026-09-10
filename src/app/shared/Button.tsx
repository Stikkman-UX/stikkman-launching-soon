"use client";

import Link from "next/link";
import { CONTACT_HREF } from "@/lib/contactCta";

type ButtonProps = {
  text: string;
  href?: string;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  withoutIcon?: boolean;
  loading?: boolean;
  /**
   * Smooth-scrolls to the footer contact form and focuses it, instead of
   * navigating. Implied by `href="#contact"` — see `isContactCta` below.
   */
  contactCta?: boolean;
  /**
   * Navigates with a plain `<a>` — a full document load — instead of
   * `next/link`'s client-side transition. Ignored without an `href`.
   *
   * The reason to want one: the header's intro splash runs from a mount-time
   * effect and the header lives in the root layout, so a client-side
   * navigation keeps it mounted and the animation never replays (same as the
   * wordmark in `shared/Header.tsx`, which is a bare `<a>` for exactly this).
   * A button that sends someone back to the landing page wants that splash.
   */
  hardNavigate?: boolean;
};

function ArrowIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        d="M7 17L17 7M17 7H9M17 7V15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth={4}
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// Diagonal background sweep: a low-opacity slanted panel parked off the
// left edge, slid past the right edge on hover — a tint passing through
// rather than a solid repaint, so the button text underneath stays
// readable throughout. Keys off the nearest ancestor carrying the named
// group `group/sweep` — that ancestor also needs `relative overflow-hidden`
// so the panel is clipped to its own shape instead of spilling out.
// `variant` picks the panel color: "light" (white) for dark buttons, "dark"
// (violet) for light buttons, so the sweep stays visible against whichever
// background it moves across. `transition-transform` stays on at all times
// so the property itself never flickers on/off; only `duration` toggles
// between 0 (idle/leave — snaps back instantly) and 500ms (hover — animates),
// which is what keeps the sweep a one-way, left-to-right effect instead of
// also playing in reverse on mouse-leave.
export function ButtonHoverSweep({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  const sweepColorClassName = variant === "dark" ? "bg-[#392B56]/20" : "bg-white/30";

  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-y-0 left-0 w-2/3 translate-x-[-150%] skew-x-[-20deg] blur-lg transition-transform duration-0 ease-out group-hover/sweep:translate-x-[220%] group-hover/sweep:duration-700 ${sweepColorClassName}`}
    />
  );
}

function ButtonContent({
  text,
  withoutIcon,
  loading,
}: Pick<ButtonProps, "text" | "withoutIcon" | "loading">) {
  if (loading) {
    return (
      <span className="relative z-10 inline-flex items-center gap-2">
        <Spinner />
        Loading...
      </span>
    );
  }

  return (
    <span className="relative z-10 inline-flex items-center gap-2">
      {text}
      {!withoutIcon && <ArrowIcon />}
    </span>
  );
}

function renderButton(colorClassName: string, sweepVariant: "light" | "dark", {
  text,
  href,
  className = "",
  onClick,
  type = "button",
  disabled = false,
  withoutIcon = false,
  loading = false,
  contactCta = false,
  hardNavigate = false,
}: ButtonProps) {
  const sharedClassName = `group relative overflow-hidden cursor-pointer inline-flex w-fit items-center justify-center gap-2 rounded-full px-6 py-3 h-11 text-xs transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${colorClassName}`;

  // A CTA aimed at the contact form renders as a real button, never a link,
  // even when it was authored as `href="#contact"` (which is how a CMS admin
  // has to express it — the admin panel only offers an href field). Scrolling
  // is an action on this page, not a destination: routing to the hash writes
  // it into the URL, and clicking the same link again is then a no-op because
  // the hash hasn't changed. A button has no such state, so it works on the
  // first click and every one after it. The actual scroll is handled by the
  // delegated listener in `shared/ContactCtaListener.tsx`.
  const isContactCta = contactCta || href === CONTACT_HREF;

  if (href && !disabled && !loading && !isContactCta) {
    const overlayProps = {
      onClick,
      "aria-label": text,
      className: "absolute inset-0 z-10 rounded-full",
    };

    // The Link overlay sits above the button (z-10 vs z-0) and captures all
    // pointer events, so the button itself never receives a real :hover —
    // the sweep must key off this wrapping span (named `group/sweep` so it
    // isn't shadowed by the button's own closer, but inert, `group`).
    return (
      <span className={`relative inline-flex group/sweep ${className}`}>
        {hardNavigate ? (
          <a href={href} {...overlayProps} />
        ) : (
          <Link href={href} {...overlayProps} />
        )}
        <button
          type="button"
          aria-hidden="true"
          tabIndex={-1}
          className={`relative z-0 ${sharedClassName}`}
        >
          <ButtonHoverSweep variant={sweepVariant} />
          <ButtonContent text={text} withoutIcon={withoutIcon} loading={loading} />
        </button>
      </span>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      data-contact-cta={isContactCta || undefined}
      className={`group/sweep ${sharedClassName} ${className}`}
    >
      <ButtonHoverSweep variant={sweepVariant} />
      <ButtonContent text={text} withoutIcon={withoutIcon} loading={loading} />
    </button>
  );
}

export function ButtonBlue(props: ButtonProps) {
  return renderButton("bg-[#392B56] text-white", "light", props);
}

export function ButtonWhite(props: ButtonProps) {
  return renderButton("bg-white border border-[#0A0A0A40] text-[#392B56]", "dark", props);
}

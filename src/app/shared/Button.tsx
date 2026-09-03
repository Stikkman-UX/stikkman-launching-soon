"use client";

type ButtonProps = {
  text: string;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  withoutIcon?: boolean;
  loading?: boolean;
};

/**
 * Every dimension inside the button is expressed in `em`, so the whole
 * control scales with `text-micro`'s fluid font size instead of staying a
 * fixed 44px pill that shrinks into a large display. At the 12px floor these
 * resolve to exactly the main site's values: `px-6` (24px), `h-11` (44px),
 * `gap-2` (8px), and a 14px icon.
 */
function ArrowIcon() {
  return (
    <svg
      className="h-[1.17em] w-[1.17em] shrink-0"
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
    <svg
      className="h-[1.17em] w-[1.17em] shrink-0 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
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
// rather than a solid repaint. Keys off `group/sweep`; that ancestor needs
// `relative overflow-hidden`. `transition-transform` stays on at all times;
// only `duration` toggles between 0 (idle/leave — snaps back instantly) and
// 700ms (hover), which keeps the sweep one-way, left-to-right.
export function ButtonHoverSweep({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  const sweepColorClassName =
    variant === "dark" ? "bg-[#392B56]/20" : "bg-white/30";

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
      <span className="relative z-10 inline-flex items-center gap-[0.67em]">
        <Spinner />
        Loading...
      </span>
    );
  }

  return (
    <span className="relative z-10 inline-flex items-center gap-[0.67em]">
      {text}
      {!withoutIcon && <ArrowIcon />}
    </span>
  );
}

/**
 * Ported from the main site's `shared/Button.tsx`, minus its `href`/`Link`
 * overlay branch and the `contactCta` scroll plumbing: every button on this
 * page is an `onClick` handler, never a destination.
 */
function renderButton(
  colorClassName: string,
  sweepVariant: "light" | "dark",
  {
    text,
    className = "",
    onClick,
    type = "button",
    disabled = false,
    withoutIcon = false,
    loading = false,
  }: ButtonProps,
) {
  const sharedClassName = `group relative overflow-hidden cursor-pointer inline-flex w-fit items-center justify-center gap-[0.67em] rounded-full px-[2em] h-[3.67em] text-micro transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${colorClassName}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
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
  return renderButton(
    "bg-white border border-[#0A0A0A40] text-[#392B56]",
    "dark",
    props,
  );
}

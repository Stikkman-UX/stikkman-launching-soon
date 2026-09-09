/**
 * The filled check used by every "we got it" success state — the footer
 * contact form's and the "request company deck" modal's alike, so the two
 * never drift apart. Defaults match the footer's dark-surface look
 * (`bg-white/10`, white check); pass `className`/`iconClassName` to adapt it
 * to a light surface (see `RequestDeckModal`).
 */
export default function SuccessCheckIcon({
  className = "h-12 w-12 bg-white/10",
  iconClassName = "h-6 w-6 text-white",
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span
      className={`animate-success-check flex items-center justify-center rounded-full ${className}`}
    >
      <svg
        className={iconClassName}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

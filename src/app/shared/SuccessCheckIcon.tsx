/**
 * The filled check that heads every "we got it" state — the email request
 * modal's and the contact panel's alike, so the two never drift apart.
 *
 * Sized in fluid tokens rather than the main site's fixed `h-14`/`h-7`: at
 * 1440px these are exactly that 56px disc with a 28px tick.
 */
export default function SuccessCheckIcon() {
  return (
    <span className="animate-success-check flex h-[max(56px,3.9vw)] w-[max(56px,3.9vw)] items-center justify-center rounded-full bg-[#392B56]">
      <svg
        className="h-[max(28px,1.95vw)] w-[max(28px,1.95vw)] text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

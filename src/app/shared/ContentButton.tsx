import { ButtonBlue, ButtonWhite } from "@/app/shared/Button";
import type { CmsButton } from "@/lib/api/types";

/**
 * Renders one admin-managed button (`CmsButton`). Every section that shows a
 * CMS button goes through here, so the colour switch and the footer-CTA
 * handoff are written once instead of per section.
 *
 * `contactCta` wins over `href`: `Button` turns a contact CTA into a real
 * `<button>` that scrolls to the footer form (see `lib/contactCta.ts`), so
 * passing an href alongside it would be dead weight — and an admin who ticks
 * the footer-CTA box is allowed to leave the link empty.
 */
export default function ContentButton({
  button,
  className,
  withoutIcon,
}: {
  button: CmsButton;
  className?: string;
  withoutIcon?: boolean;
}) {
  const Component = button.color === "white" ? ButtonWhite : ButtonBlue;

  return (
    <Component
      text={button.text}
      href={button.contactCta ? undefined : button.href}
      contactCta={button.contactCta}
      className={className}
      withoutIcon={withoutIcon}
    />
  );
}

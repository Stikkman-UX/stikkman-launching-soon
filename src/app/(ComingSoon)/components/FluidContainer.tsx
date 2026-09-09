import { ElementType, ReactNode } from "react";

/**
 * Full-bleed page gutter, for the Coming Soon page only.
 *
 * Deliberately NOT `shared/Container`: that one centres its content and caps
 * it at 1550px, and the cap is the thing this page cannot use. Past it the
 * content stops growing while the viewport keeps going, so on a large display
 * a single full-screen composition becomes a small block stranded in the
 * middle of the screen.
 *
 * Here there is no cap at all — only the fluid gutter (`--spacing-gutter` in
 * globals.css), so the composition is identical at every width and only its
 * absolute size changes.
 */
export default function FluidContainer({
  as: Tag = "div",
  className = "",
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return <Tag className={`w-full px-gutter ${className}`}>{children}</Tag>;
}

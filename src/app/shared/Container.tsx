import { ElementType, ReactNode } from "react";

/**
 * Full-bleed page gutter.
 *
 * Deliberately NOT the main site's container: that one centres its content
 * and caps it at 1550px with 16/80px gutters, and the cap is the thing this
 * app cannot use. Past it the content stops growing while the
 * viewport keeps going, so on a large display the page becomes a small block
 * stranded in the middle of the screen instead of filling it.
 *
 * Here there is no cap at all - only a fluid gutter (`--spacing-gutter` in
 * globals.css) that grows with the viewport, so the composition is identical
 * at every width and only its absolute size changes.
 */
export default function Container({
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

/**
 * The site's "// EYEBROW LABEL" mark. Owns the full typography (font, size,
 * weight, line-height, letter-spacing) so every eyebrow across the site is
 * pixel-identical instead of each section re-declaring its own slightly
 * different values. `className` extends/overrides the wrapper (color,
 * alignment, positioning); the "//" glyph's own color is controlled by
 * `invert` since it's independent of the label text's color.
 *
 * `sizeClassName` is the one deliberate escape hatch, for the Coming Soon
 * page: that page is laid out on the fluid scale (see the `@theme` block in
 * globals.css), so its eyebrows have to grow with the viewport rather than
 * hold the site's fixed 12px. It replaces the size trio wholesale instead of
 * being appended to it, since two competing `text-*`/`tracking-*` utilities
 * on one element resolve by stylesheet order, not by class order. At the
 * fluid floor `text-micro`/`0.1725em` is exactly this default.
 */
const HighlightMark = ({
  text,
  invert = false,
  className = "",
  sizeClassName = "text-xs leading-4 tracking-[2.07px]",
}: {
  text: string;
  invert?: boolean;
  className?: string;
  sizeClassName?: string;
}) => {
  return (
    <p
      className={`font-mono ${sizeClassName} font-normal uppercase ${className}`}
    >
      <span
        className={`mr-1 inline-block font-bold ${invert ? "text-white" : "text-[#392B56]"}`}
      >
        {"//"}
      </span>
      <span>{text}</span>
    </p>
  );
};

export default HighlightMark;

/**
 * The site's "// EYEBROW LABEL" mark. Owns the full typography (font, size,
 * weight, line-height, letter-spacing) so every eyebrow is pixel-identical
 * instead of each section re-declaring its own slightly different values.
 * `className` extends/overrides the wrapper (color, alignment, positioning);
 * the "//" glyph's own color is controlled by `invert` since it's independent
 * of the label text's color.
 *
 * Sizing differs from the main site's copy in one way: the font size is the
 * fluid `text-micro` token and the tracking is expressed in `em` rather than
 * a fixed 2.07px, so the letter-spacing keeps its proportion as the type
 * grows. At the 12px floor `0.1725em` is exactly 2.07px.
 */
const HighlightMark = ({
  text,
  invert = false,
  className = "",
}: {
  text: string;
  invert?: boolean;
  className?: string;
}) => {
  return (
    <p
      className={`font-mono text-micro font-normal tracking-[0.1725em] uppercase ${className}`}
    >
      <span
        className={`mr-[0.33em] inline-block font-bold ${invert ? "text-white" : "text-[#392B56]"}`}
      >
        {"//"}
      </span>
      <span>{text}</span>
    </p>
  );
};

export default HighlightMark;

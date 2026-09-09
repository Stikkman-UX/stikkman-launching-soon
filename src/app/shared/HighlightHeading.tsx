/**
 * Renders a multi-line heading where each line is plain text optionally
 * followed by a highlighted trailing word/phrase — e.g. About's Hero:
 * "Where brands" / "become <experiences.>". Each `{text, highlight?}` entry
 * becomes its own block-level line (mirrors how `HeroTitle` breaks
 * admin-controlled heading lines), so the admin's line breaks are respected
 * verbatim rather than this component trying to reflow the copy.
 *
 * Fresh build — there is no prior working renderer for this shape anywhere
 * in the codebase (Home's Hero has a same-shaped `highlight` field that is
 * dead/unused), see root CLAUDE.md's About Us status note.
 */
export type HighlightHeadingLine = { text: string; highlight?: string };

export default function HighlightHeading({
  lines,
  as: Tag = "h1",
  className,
  highlightClassName,
}: {
  lines: HighlightHeadingLine[];
  as?: "h1" | "h2";
  className?: string;
  highlightClassName?: string;
}) {
  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block">
          {line.text}
          {line.highlight ? (
            <span className={highlightClassName ?? "text-[#6D5B95]"}>
              {line.text ? " " : ""}
              {line.highlight}
            </span>
          ) : null}
        </span>
      ))}
    </Tag>
  );
}

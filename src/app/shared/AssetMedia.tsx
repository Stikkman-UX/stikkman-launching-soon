import type { CaseStudyAsset } from "@/lib/api/types";

/**
 * Shared `{ url, type }` → `<img>`/`<video>` branch. The same idiom was
 * already inlined once in `(Home)/components/ProjectCard.tsx` (as a
 * background-image div); promoted here as an element so callers can size and
 * position it themselves — Case Study Hero/Showcase/Gallery all need the
 * media itself to fill a caller-defined wrapper, not sit as a background
 * layer.
 */
export default function AssetMedia({
  asset,
  className,
}: {
  asset: CaseStudyAsset;
  className?: string;
}) {
  if (asset.type === "video") {
    return (
      <video
        src={asset.url}
        autoPlay
        muted
        loop
        playsInline
        className={className}
      />
    );
  }

  return (
    // Admin-supplied S3 URL — next/image would need a remotePatterns
    // allowlist for a domain we don't control here (same reasoning as the
    // admin-only previews in `ImageField.tsx`/`ProjectsAdminBoard.tsx`).
    // eslint-disable-next-line @next/next/no-img-element
    <img src={asset.url} alt="" className={className} />
  );
}

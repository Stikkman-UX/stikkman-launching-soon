import { heroLogos } from "@/app/(ComingSoon)/data/landing";

/**
 * The landing hero's client-logo strip: one row scrolling left, forever.
 *
 * Every logo is `h-[…] w-auto object-contain`, so they all take the exact
 * same height and each keeps its own width — which is what makes a set of
 * mixed-aspect files read as one row rather than a ragged one. The height is
 * fluid like everything else on this page (see the `@theme` block in
 * globals.css), so the strip grows with the viewport instead of shrinking
 * into a large display.
 *
 * The list is rendered twice and the track translates by exactly -50%
 * (`.animate-logo-marquee`), so the second copy is under the cursor at the
 * moment the first one leaves and the loop has no seam. That equality is why
 * the spacing is a right *margin on every item* rather than a flex `gap`: a
 * gap sits only *between* items, so the track would be one gap short of two
 * whole periods and -50% would land slightly off, jumping every lap.
 *
 * The mask fades both ends to transparent rather than painting a white
 * gradient over them — the hero's background is a video behind two scrims,
 * so a solid fade would only match the page where the scrim happens to be
 * fully opaque.
 */
const FADE =
  "linear-gradient(90deg, transparent 0, black 10%, black 88%, transparent 100%)";

export default function LogoCarousel({ className = "" }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{ maskImage: FADE, WebkitMaskImage: FADE }}
    >
      <div className="animate-logo-marquee flex w-max items-center">
        {[...heroLogos, ...heroLogos].map((logo, i) => {
          const isDuplicate = i >= heroLogos.length;

          return (
            <img
              key={i}
              src={logo.src}
              // The second copy is the same logos again, so it is announced
              // once, not twice.
              alt={isDuplicate ? "" : logo.name}
              aria-hidden={isDuplicate || undefined}
              // One height for every mark, `w-auto` for every width. The
              // floor does the work at ordinary widths — 2vw only overtakes
              // 34px past about 1700px — which keeps the marks legible on a
              // laptop rather than scaling them down with the viewport.
              // Wider apart on a phone, where the strip is the full width and
              // the marks would otherwise crowd; the `lg` value is the one
              // tuned for the desktop corner.
              className="mr-7 h-[max(34px,2vw)] w-auto object-contain lg:mr-[max(16px,1.5vw)]"
            />
          );
        })}
      </div>
    </div>
  );
}

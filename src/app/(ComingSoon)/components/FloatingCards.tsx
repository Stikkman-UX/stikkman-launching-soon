import { floatingCards } from "@/app/(ComingSoon)/data/landing";

/**
 * The four tilted cards at the corners of the holding page — the studio's
 * numbers as small at-a-glance widgets, the way a product's coming-soon page
 * previews its own UI. Decoration: `aria-hidden`, `pointer-events-none`, and
 * only rendered from `lg` up, where the corners are clear of the centred
 * stack.
 *
 * Each has two motions on two elements, so neither cancels the other: the
 * outer `animate-fade-in-up` (staggered, after the header intro) and an
 * inner `animate-drift`, with a different period per card so the four never
 * bob in unison. The two lower cards are softened — a touch of blur and less
 * opacity — which reads as depth without any real 3D.
 */

/** Relative bar heights — an "up and to the right" shape, nothing measured. */
const BARS = [38, 52, 30, 64, 46, 88, 58];

function Card({
  label,
  value,
  tag,
  children,
  className,
  delay,
  period,
}: {
  label: string;
  value: string;
  tag: string;
  children: React.ReactNode;
  className: string;
  delay: string;
  period: string;
}) {
  return (
    <div
      className={`animate-fade-in-up absolute ${className}`}
      style={{ animationDelay: delay }}
    >
      <div
        className="animate-drift w-[clamp(150px,12.5vw,200px)] rounded-2xl border border-[#392B5612] bg-white/90 p-[max(12px,0.9vw)] text-[max(11px,0.78vw)] shadow-[0_22px_44px_-22px_rgba(57,43,86,0.35)] backdrop-blur-sm"
        style={{ animationDuration: period }}
      >
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-semibold text-[#392B56]">{label}</span>
          <span className="font-mono text-[0.72em] tracking-[0.12em] text-[#8A8781] uppercase">
            {tag}
          </span>
        </div>
        <p className="no-text-trim mt-[0.35em] font-mono text-[1.5em] tracking-[-0.02em] text-[#392B56]">
          {value}
        </p>
        <div className="mt-[0.9em]">{children}</div>
      </div>
    </div>
  );
}

export default function FloatingCards() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
      <Card
        {...floatingCards.lives}
        className="top-[13vh] left-[4vw] -rotate-6"
        delay="2.1s"
        period="6.5s"
      >
        <div className="flex h-[2.6em] items-end gap-[0.3em]">
          {BARS.map((height, i) => (
            <span
              key={i}
              className={`flex-1 rounded-[0.2em] ${i === BARS.length - 2 ? "bg-[#392B56]" : i % 2 ? "bg-[#C9BEFA]" : "bg-[#E4DDFB]"}`}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </Card>

      <Card
        {...floatingCards.clients}
        className="top-[17vh] right-[5vw] rotate-3"
        delay="2.3s"
        period="7.5s"
      >
        <div className="flex items-center gap-[0.8em]">
          {/* r=16 → circumference ≈ 100.5, so the dash is a percentage. */}
          <svg viewBox="0 0 40 40" className="h-[2.6em] w-[2.6em] -rotate-90">
            <circle cx="20" cy="20" r="16" fill="none" stroke="#E4DDFB" strokeWidth="5" />
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="#392B56"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="78 100.5"
            />
          </svg>
          <div className="flex flex-1 flex-col gap-[0.4em]">
            <span className="h-[0.45em] w-full rounded-full bg-[#EFEDE9]" />
            <span className="h-[0.45em] w-3/4 rounded-full bg-[#EFEDE9]" />
            <span className="h-[0.45em] w-1/2 rounded-full bg-[#EFEDE9]" />
          </div>
        </div>
      </Card>

      <Card
        {...floatingCards.studios}
        className="right-[7vw] bottom-[19vh] -rotate-2 opacity-80 blur-[0.6px]"
        delay="2.5s"
        period="8.5s"
      >
        <div className="flex items-center gap-[0.5em]">
          {["BLR", "NYC", "DXB"].map((city, i) => (
            <span
              key={city}
              className={`flex h-[1.9em] flex-1 items-center justify-center rounded-[0.5em] font-mono text-[0.72em] tracking-[0.1em] ${i === 0 ? "bg-[#392B56] text-white" : "bg-[#EFEDE9] text-[#8A8781]"}`}
            >
              {city}
            </span>
          ))}
        </div>
      </Card>

      <Card
        {...floatingCards.site}
        className="bottom-[21vh] left-[6vw] rotate-3 opacity-80 blur-[0.6px]"
        delay="2.7s"
        period="7s"
      >
        <div className="flex items-center gap-[0.6em]">
          <span className="h-[0.55em] flex-1 overflow-hidden rounded-full bg-[#EFEDE9]">
            <span className="block h-full w-[76%] rounded-full bg-[#8E7BE0]" />
          </span>
          <span className="font-mono text-[0.72em] text-[#8A8781]">76%</span>
        </div>
      </Card>
    </div>
  );
}

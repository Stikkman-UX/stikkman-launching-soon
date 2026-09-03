"use client";

import { Fragment, useSyncExternalStore } from "react";
import { LAUNCH_DATE } from "@/app/(ComingSoon)/data/landing";
import { remainingSeconds, toUnits, type Units } from "@/lib/countdown";

const LABELS: { key: keyof Units; label: string }[] = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 1000);
  return () => window.clearInterval(id);
}

/**
 * A primitive, not an object: `useSyncExternalStore` compares snapshots by
 * identity, so returning a fresh object every call would re-render forever.
 */
function getRemainingSeconds() {
  return remainingSeconds(LAUNCH_DATE, Date.now());
}

/** `null` on the server and through hydration — see the note in the component. */
const getServerSnapshot = () => null;

// `text-display` is the fluid token sized down from the hero's scale: this is
// corner-of-the-screen secondary information, not a headline.
const digitClassName = "no-text-trim font-mono text-display text-[#392B56]";

/**
 * Counts down to `LAUNCH_DATE`.
 *
 * The clock is an external mutable source, so it is read through
 * `useSyncExternalStore` rather than a `setState`-on-an-interval effect. The
 * server snapshot is deliberately `null`: the remaining time depends on
 * `Date.now()`, which differs between the server render and the client, so
 * both render the same `--` placeholder and hydration matches. The
 * placeholder is the same markup with the digits swapped out, so nothing
 * reflows when the first real tick lands.
 */
export default function Countdown() {
  const totalSeconds = useSyncExternalStore<number | null>(
    subscribe,
    getRemainingSeconds,
    getServerSnapshot,
  );

  if (totalSeconds === 0) {
    return <p className={digitClassName}>WE ARE LIVE</p>;
  }

  const units = totalSeconds === null ? null : toUnits(totalSeconds);

  const label =
    units === null
      ? "Counting down to launch on 14 September 2026."
      : `Launching in ${Number(units.days)} days, ${Number(units.hours)} hours, ${Number(units.minutes)} minutes and ${Number(units.seconds)} seconds.`;

  return (
    <div>
      {/* One readable sentence for assistive tech instead of eight
          disconnected numbers and labels. Deliberately not a live region — a
          value that changes every second would be announced endlessly. */}
      <p className="sr-only">{label}</p>

      <div aria-hidden="true" className="flex items-start gap-fluid-xs">
        {LABELS.map((unit, i) => (
          <Fragment key={unit.key}>
            {/* Decoration, not structure: hidden below lg, where the four
                label-width columns plus these separators would overrun the
                328px of content space left at the 360px floor. */}
            {i > 0 && (
              <p className={`${digitClassName} hidden text-[#392B5666]! lg:block`}>
                :
              </p>
            )}
            <div className="flex flex-col items-center gap-fluid-2xs">
              {/* Optical alignment is meaningless on monospace numerals — their
                  bearings are symmetric by construction — and the shift would
                  fight the centering above. */}
              <p data-optical="off" className={digitClassName}>
                {units === null ? "--" : units[unit.key]}
              </p>
              <p className="font-mono text-nano tracking-[0.172em] text-[#8A8781] uppercase">
                {unit.label}
              </p>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

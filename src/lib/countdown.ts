/**
 * Pure countdown math, kept out of the component so it can be exercised
 * directly (no DOM, no React) — the zero boundary in particular, which is
 * otherwise only reachable by editing the launch date.
 */

/** At least two digits, but never truncated — a 3-digit day count still fits. */
export const pad = (value: number) => String(value).padStart(2, "0");

export type Units = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

/**
 * Whole seconds between `now` and `target`, clamped at 0. Clamping here — and
 * not at format time — is what guarantees a launch instant in the past can
 * only ever produce the live state, never a negative or NaN digit.
 */
export function remainingSeconds(target: Date, now: number): number {
  return Math.max(0, Math.floor((target.getTime() - now) / 1000));
}

export function toUnits(totalSeconds: number): Units {
  return {
    days: pad(Math.floor(totalSeconds / 86400)),
    hours: pad(Math.floor((totalSeconds % 86400) / 3600)),
    minutes: pad(Math.floor((totalSeconds % 3600) / 60)),
    seconds: pad(totalSeconds % 60),
  };
}

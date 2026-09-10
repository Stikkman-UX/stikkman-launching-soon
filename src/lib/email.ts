/**
 * The one email check every capture form on this site runs — the modal's
 * deck request and the holding page's inline form alike — kept identical to
 * the main site's contact forms so an address accepted here is accepted
 * there too.
 */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed === "") return "Email is required";
  if (!EMAIL_PATTERN.test(trimmed)) return "Enter a valid email address";
  return undefined;
}

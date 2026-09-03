/**
 * The one place this app talks to the outside world.
 *
 * Both request forms post here; the endpoint is a Google Apps Script web app
 * (`google-apps-script/Code.gs` in this repo) which appends the submission to
 * a sheet and sends the two emails. See that folder's README for the sheet
 * tabs, their header rows, and how to deploy.
 *
 * Two constraints come from the Apps Script side and explain the shape below:
 *
 * 1. The payload is `application/x-www-form-urlencoded`, not JSON. That keeps
 *    the request a CORS "simple request", so the browser sends no preflight —
 *    an Apps Script web app cannot answer an `OPTIONS` preflight, so a JSON
 *    content type would fail before it ever reached the sheet. It is also
 *    what the script's `parseFormData` reads.
 *
 * 2. Every key must be spelled exactly like the column header it belongs to.
 *    The script maps the sheet's header row onto the posted data
 *    (`headers.map(h => data[h])`), so a renamed header or a renamed key
 *    silently writes an empty cell. The header names live in `SHEET_HEADERS`
 *    below so both forms and the script's README quote one source.
 */

/**
 * Deployment URL of the Apps Script web app (`.../exec`).
 *
 * Public by necessity — the browser makes this call — hence `NEXT_PUBLIC_`.
 * Missing config is surfaced as a failed submit rather than a silent no-op:
 * a form that looks like it sent and didn't is the worse failure.
 */
const ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? "";

/** Apps Script sends two emails before it replies, so the wait is generous. */
const TIMEOUT_MS = 30_000;

/** Column headers, exactly as they read in the spreadsheet's first row. */
export const SHEET_HEADERS = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  category: "Category",
  services: "Services",
  message: "Message",
  request: "Request",
} as const;

export type SubmissionPayload = Record<string, string>;

/**
 * Posts one submission and resolves only once the script has confirmed it.
 *
 * Throws on a missing endpoint, a network failure, a non-2xx response, or a
 * `{ success: false }` body — every case the caller should show as "not
 * sent", so a visitor is never told their brief arrived when it didn't.
 */
export async function submitToSheet(
  targetSheet: string,
  payload: SubmissionPayload,
): Promise<void> {
  if (!ENDPOINT) {
    throw new Error("NEXT_PUBLIC_FORM_ENDPOINT is not configured");
  }

  const body = new URLSearchParams({ ...payload, targetSheet });

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: body.toString(),
    // Apps Script answers a web app POST with a 302 to
    // script.googleusercontent.com; the real response is behind it.
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Submission failed with status ${response.status}`);
  }

  // The script replies `{"success":true}`.
  const raw = await response.text();

  let parsed: { success?: boolean; error?: string } | undefined;
  try {
    parsed = JSON.parse(raw) as { success?: boolean; error?: string };
  } catch {
    // Not JSON — but Apps Script still answered 200, which means the row was
    // written. Better to accept it than to tell someone to send a brief they
    // have already sent.
    return;
  }

  if (parsed?.success === false) {
    throw new Error(parsed.error ?? "Submission was rejected");
  }
}

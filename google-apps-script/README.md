# Submissions endpoint (Google Sheets + Apps Script)

`Code.gs` receives both request forms from the landing page, appends each
submission to the spreadsheet, and sends two emails — one to the studio, one
to the person who submitted.

## 1. The spreadsheet

Create one spreadsheet with **two tabs**, named exactly:

- `Company Deck`
- `Callback Request`

The tab name is what the site posts as `targetSheet`, and what the script
switches on to pick the confirmation email. It must match character for
character (see `sheet` in `src/app/(ComingSoon)/data/landing.ts`).

### Header rows

Row 1 of each tab **is** the schema: the script maps each header onto the
posted field of the same name (`headers.map(h => data[h])`), so a header typo
writes an empty cell rather than an error. Spelling and order below; the order
is free to change, the spelling is not.

**`Company Deck`** — row 1, columns A–E:

| Timestamp | Name | Email | Request | Status |
| --------- | ---- | ----- | ------- | ------ |

**`Callback Request`** — row 1, columns A–H:

| Timestamp | Category | Name | Email | Phone | Services | Message | Status |
| --------- | -------- | ---- | ----- | ----- | -------- | ------- | ------ |

`Timestamp` and `Status` are filled in by the script, not by the browser.
`Status` reads `Received` while the row is written and `Emails sent` once both
emails are away, so a row still saying `Received` means the mail step failed.

The header names the site sends live in one place — `SHEET_HEADERS` in
`src/lib/formSubmission.ts`. Change a header here, change it there.

## 2. The script

1. In the spreadsheet: **Extensions → Apps Script**.
2. Replace the contents of `Code.gs` with this folder's `Code.gs`.
3. Set `NOTIFY_EMAIL` at the top to whoever should receive studio
   notifications.
4. **Deploy → New deployment → Web app**, with:
   - _Execute as_: **Me**
   - _Who has access_: **Anyone**

   "Anyone" is required. The browser posts cross-origin, and only that setting
   returns the `Access-Control-Allow-Origin` header the request needs — with
   "Anyone with Google account" the submit fails in the browser even though
   the script is fine.
5. Authorise when prompted (the script sends mail as you, so it asks for Gmail
   permission).
6. Copy the deployment's `/exec` URL.

Re-deploy after every edit: **Deploy → Manage deployments → edit → New
version**. Saving the editor alone does not change what the `/exec` URL runs.

## 3. The site

Put the `/exec` URL in `.env.local` at the repo root (git-ignored):

```
NEXT_PUBLIC_FORM_ENDPOINT=https://script.google.com/macros/s/AKfycb.../exec
```

Add the same variable to the hosting environment (Vercel → Settings →
Environment Variables) before deploying. Without it both forms fail their
submit and say so — deliberately, so a broken endpoint is never mistaken for a
delivered brief.

The value is public by nature (the browser makes the call), hence
`NEXT_PUBLIC_`. Anyone who reads the page source can post to it, so treat the
sheet as append-only public input.

## Notes

- **Payload format.** The site posts `application/x-www-form-urlencoded`, not
  JSON. That keeps it a CORS "simple request", so the browser sends no
  `OPTIONS` preflight — an Apps Script web app cannot answer one.
- **Spaces.** `URLSearchParams` encodes a space as `+`, which
  `decodeURIComponent` does not undo; `decodeFormValue` swaps it back. Without
  that, "New project" would land in the sheet as "New+project".
- **Quota.** `MailApp.sendEmail` allows 100 recipients/day on a consumer
  account, 1,500 on Workspace. Two emails per submission.
- **Testing without the site.** Run this in a terminal against the `/exec`
  URL:

  ```sh
  curl -L -X POST '<exec-url>' \
    --data-urlencode 'targetSheet=Company Deck' \
    --data-urlencode 'Name=Test Person' \
    --data-urlencode 'Email=you@example.com' \
    --data-urlencode 'Request=Request Company Deck'
  ```

  Expect `{"success":true}`, a new row, and two emails. `-L` matters: Apps
  Script answers with a redirect to the real response.

/**
 * Stikkman UX — launching-soon form endpoint.
 *
 * Bound to the submissions spreadsheet and deployed as a web app; the site
 * posts here from `src/lib/formSubmission.ts`. One POST does four things:
 * append the row to the tab named by `targetSheet`, email the studio, email
 * the person who submitted, and stamp the row as notified.
 *
 * Same layout as the form script this was adapted from, with four changes:
 *
 *   1. `parseFormData` now turns `+` back into a space. `URLSearchParams`
 *      encodes spaces that way and `decodeURIComponent` does not undo it, so
 *      without this every multi-word value lands in the sheet as
 *      "New+project".
 *   2. `Timestamp` and `Status` are filled in here rather than posted, so the
 *      browser can't set them.
 *   3. The two sheets are "Company Deck" and "Callback Request".
 *   4. Both confirmation emails are Stikkman's, chosen by target sheet.
 *
 * Setup, tab names and header rows: see README.md next to this file.
 */

/** Where studio notifications go. */
const NOTIFY_EMAIL = "aurobindobhuyan6@gmail.com";

/** Managed by this script, never taken from the request. */
const TIMESTAMP_HEADER = "Timestamp";
const STATUS_HEADER = "Status";

const BRAND_COLOR = "#392B56";

var sheet;

const doPost = (request = {}) => {
  const { postData: { contents } = {} } = request;
  var data = parseFormData(contents);

  updateSheetValue(data);

  if (!sheet) {
    return jsonOutput({
      success: false,
      error: "Unknown target sheet: " + data.targetSheet
    });
  }

  const rowData = appendToGoogleSheet(data);

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  sendEmailNotification(rowData, headers, data);
  sendUserConfirmationEmail(data);

  markRowAsNotified(headers);

  return jsonOutput({ success: true });
}

function jsonOutput(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function parseFormData(postData) {
  var data = {};
  if (!postData) return data;

  var parameters = postData.split('&');
  for (var i = 0; i < parameters.length; i++) {
    var keyValue = parameters[i].split("=");
    var key = decodeFormValue(keyValue[0]);
    if (!key) continue;
    data[key] = decodeFormValue(keyValue[1]);
  }
  return data;
}

/**
 * `application/x-www-form-urlencoded` writes a space as `+`, which
 * `decodeURIComponent` leaves alone — swap it back before decoding.
 */
function decodeFormValue(value) {
  if (!value) return "";
  return decodeURIComponent(String(value).replace(/\+/g, "%20"));
}

function updateSheetValue(data) {
  sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(data.targetSheet);
}

function appendToGoogleSheet(data) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  var rowData = headers.map(function (headerFld) {
    if (headerFld === TIMESTAMP_HEADER) return currentTimestamp();
    if (headerFld === STATUS_HEADER) return "Received";
    return data[headerFld] || "";
  });

  sheet.appendRow(rowData);

  return rowData;
}

function currentTimestamp() {
  return Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "yyyy-MM-dd HH:mm:ss"
  );
}

/**
 * Closes the loop on the row just appended: whoever opens the sheet can see
 * at a glance which submissions the automation has already answered.
 */
function markRowAsNotified(headers) {
  var statusColumn = headers.indexOf(STATUS_HEADER) + 1;
  if (statusColumn < 1) return;

  sheet.getRange(sheet.getLastRow(), statusColumn).setValue("Emails sent");
}

function formatRowDataAsEmail(rowData, headers) {
  var formattedText = "";
  for (var i = 0; i < rowData.length; i++) {
    formattedText += headers[i] + ": " + rowData[i] + "\n";
  }
  return formattedText;
}

function getEmailConfig(targetSheet, rowData, headers) {
  let subject = "New Form Submission";
  let heading = "New Submission Received";

  switch (targetSheet) {
    case "Company Deck":
      subject = "New Company Deck Request";
      heading = "Company Deck Request";
      break;

    case "Callback Request":
      subject = "New Callback Request";
      heading = "Callback Request";
      break;
  }

  const body = buildBeautifulEmail(rowData, headers, heading);

  return { subject, body };
}

function buildBeautifulEmail(rowData, headers, heading) {
  let rowsHtml = "";

  for (let i = 0; i < rowData.length; i++) {
    if (rowData[i]) {
      rowsHtml += `
        <tr>
          <td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f5f5f5;">
            ${headers[i]}
          </td>
          <td style="padding:8px;border:1px solid #ddd;">
            ${rowData[i]}
          </td>
        </tr>
      `;
    }
  }

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px">
      <h2 style="background:${BRAND_COLOR};color:white;padding:12px;border-radius:6px;">
        ${heading}
      </h2>

      <table style="border-collapse:collapse;width:100%;margin-top:12px;">
        ${rowsHtml}
      </table>

      <p style="margin-top:16px;font-size:12px;color:#777;">
        This is an automated notification from the Stikkman UX website form.
      </p>
    </div>
  `;
}

function sendEmailNotification(rowData, headers, data) {
  const targetSheet = data.targetSheet;

  const emailConfig = getEmailConfig(targetSheet, rowData, headers);

  try {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: emailConfig.subject,
      htmlBody: emailConfig.body
    });
    Logger.log("Email sent successfully");
  } catch (err) {
    Logger.log("Email error: " + err.toString());
  }
}

/**
 * The two visitor-facing emails. Which one is sent follows the target sheet,
 * so a new request type is a new `case` here and nothing else.
 *
 * `name` is empty for a deck request — that form asks for an email and
 * nothing else — so the greeting falls back to "Hi there".
 */
function getUserEmailConfig(targetSheet, name) {
  const greeting = `Hi ${name || "there"},`;

  if (targetSheet === "Company Deck") {
    return {
      subject: "Thanks for Your Request to Stikkman UX",
      body: buildUserEmail(`
        <p style="color:#444;font-size:14px;line-height:1.6;margin:0 0 16px;">
          ${greeting}
        </p>

        <p style="color:#444;font-size:14px;line-height:1.6;margin:0 0 16px;">
          Thanks for requesting the company deck. You will receive it shortly
          in your inbox.
        </p>
      `, "We've got your request.")
    };
  }

  return {
    subject: "Thanks for Starting a Conversation with Stikkman UX",
    body: buildUserEmail(`
      <p style="color:#444;font-size:14px;line-height:1.6;margin:0 0 16px;">
        ${greeting}
      </p>

      <p style="color:#444;font-size:14px;line-height:1.6;margin:0 0 16px;">
        Thanks for reaching out to Stikkman UX.
      </p>

      <p style="color:#444;font-size:14px;line-height:1.6;margin:0 0 16px;">
        We've received your details, and our team is currently reviewing your
        brief. We truly appreciate you taking the time to connect with us.
      </p>

      <p style="color:#444;font-size:14px;line-height:1.6;margin:0 0 16px;">
        We'll be in touch soon with the next steps in the next 24 hours.
      </p>

      <div style="margin:20px 0;padding:15px;background:#f5f5f5;border-left:4px solid ${BRAND_COLOR};">
        <p style="margin:0;font-size:14px;color:#111;line-height:1.6;">
          At Stikkman. UX, we blend behavioral psychology, deep domain
          expertise and applied AI to create digital experiences that
          <strong>MOVE REAL BUSINESS NUMBERS</strong>.
        </p>
      </div>
    `, "We've got your brief.")
  };
}

/** The shared shell both visitor emails sit inside. */
function buildUserEmail(contentHtml, heading) {
  return `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f9f9f9;padding:30px;">

      <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #eee;">

        <!-- Header -->
        <div style="background:${BRAND_COLOR};padding:20px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:1px;">
            Stikkman UX
          </h1>
        </div>

        <!-- Body -->
        <div style="padding:30px;">
          <h2 style="margin:0 0 16px;color:#111;font-size:20px;">
            ${heading}
          </h2>

          ${contentHtml}

          <p style="color:#444;font-size:14px;line-height:1.6;margin:0;">
            Warm Regards,<br/>
            <strong>Team Stikkman UX</strong>
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#fafafa;padding:15px;text-align:center;font-size:12px;color:#888;">
          This is an automated response. We'll get back to you shortly.
        </div>

      </div>
    </div>
  `;
}

function sendUserConfirmationEmail(data) {
  const userEmail = data.Email;

  if (!userEmail) return;

  const emailConfig = getUserEmailConfig(data.targetSheet, data.Name);

  try {
    MailApp.sendEmail({
      to: userEmail,
      subject: emailConfig.subject,
      htmlBody: emailConfig.body
    });
    Logger.log("User confirmation email sent");
  } catch (err) {
    Logger.log("User email error: " + err.toString());
  }
}

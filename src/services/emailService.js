import axios from "axios";

/**
 * Escapes unsafe characters for safe inclusion in HTML templates
 */
export const escapeHtml = (str) => {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Generates an academic email template for low attendance warning
 */
export const generateWarningEmailHtml = ({
  courseName,
  subject,
  bodyContent,
  instructorName,
  instructorEmail,
}) => {
  const safeSubject = escapeHtml(subject || "Attendance Notice");
  const safeCourseName = escapeHtml(courseName || "Academic Course");
  const safeInstructorName = escapeHtml(instructorName || "Course Instructor");
  const safeInstructorEmail = escapeHtml(instructorEmail || "");

  const formattedBody = (bodyContent || "")
    .split("\n\n")
    .map((paragraph) => {
      const safeParagraph = escapeHtml(paragraph).replace(/\n/g, "<br/>");
      return `<p style="margin: 0 0 16px 0; line-height: 1.6; color: #334155; font-size: 15px;">${safeParagraph}</p>`;
    })
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeSubject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAF9; margin: 0; padding: 24px 12px;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid rgba(13, 125, 112, 0.18); box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);">
    <!-- Header Banner -->
    <tr>
      <td style="background: linear-gradient(135deg, #0D7D70 0%, #0A6359 100%); padding: 28px 24px; text-align: left;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #A7F3D0; font-weight: 700; margin-bottom: 6px;">
          Gurukula Kangri (Deemed to be University) • NMRIL Labs
        </div>
        <h1 style="color: #FFFFFF; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.3px;">
          GKVFlow Academic Notice
        </h1>
        <div style="color: #E2E8F0; font-size: 14px; margin-top: 4px;">
          Course: <strong style="color: #FFFFFF;">${safeCourseName}</strong>
        </div>
      </td>
    </tr>

    <!-- Alert Status Ribbon -->
    <tr>
      <td style="background-color: #FEF3C7; border-bottom: 1px solid #FDE68A; padding: 12px 24px;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="font-size: 18px; vertical-align: middle; padding-right: 10px;">⚠️</td>
            <td style="color: #92400E; font-size: 13px; font-weight: 600;">
              Official Attendance Alert: Action Required
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Main Message Body -->
    <tr>
      <td style="padding: 28px 24px;">
        ${formattedBody}
        
        <!-- Requirement Box -->
        <div style="margin-top: 24px; padding: 16px; background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px;">
          <div style="color: #166534; font-size: 13px; font-weight: 700; margin-bottom: 4px;">
            📌 University Attendance Norms
          </div>
          <div style="color: #15803D; font-size: 13px; line-height: 1.5;">
            A minimum of 75% attendance is required to remain eligible for end-semester examinations. Please contact your course instructor immediately to rectify any discrepancies.
          </div>
        </div>
      </td>
    </tr>

    <!-- Footer Sign-off with Course Instructor Details -->
    <tr>
      <td style="background-color: #F8FAF9; border-top: 1px solid #E2E8F0; padding: 20px 24px; text-align: left;">
        <div style="color: #0F172A; font-size: 14px; font-weight: 700;">
          ${safeInstructorName}
        </div>
        <div style="color: #475569; font-size: 13px; margin-top: 2px;">
          Course Instructor • NMRIL Labs - GKV Attendance Portal
        </div>
        ${
          safeInstructorEmail
            ? `<div style="color: #0D7D70; font-size: 13px; margin-top: 4px; font-weight: 600;">Instructor Email: <a href="mailto:${safeInstructorEmail}" style="color: #0D7D70; text-decoration: underline;">${safeInstructorEmail}</a></div>`
            : ""
        }
        <div style="color: #94A3B8; font-size: 11px; margin-top: 12px; border-top: 1px dashed #CBD5E1; padding-top: 8px;">
          Project Co-Ordinator: Dr. Nishant Kumar • Developer: Rajeev Sahu
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

/**
 * Sends email through ZeptoMail via the backend proxy endpoint /api/send-email
 */
export const sendZeptoMail = async ({
  to,
  bcc,
  subject,
  bodyContent,
  courseName,
  instructorName,
  instructorEmail,
}) => {
  try {
    const htmlbody = generateWarningEmailHtml({
      courseName,
      subject,
      bodyContent,
      instructorName,
      instructorEmail,
    });

    // Format recipients
    let formattedTo = [];
    if (Array.isArray(to) && to.length > 0) {
      formattedTo = to.map((item) =>
        typeof item === "string" ? { address: item } : item
      );
    } else if (typeof to === "string" && to.trim()) {
      formattedTo = [{ address: to }];
    } else {
      formattedTo = [{ address: "noreply@gkv.ac.in" }];
    }

    let formattedBcc = [];
    if (Array.isArray(bcc) && bcc.length > 0) {
      formattedBcc = bcc.map((item) =>
        typeof item === "string" ? { address: item } : item
      );
    }

    const payload = {
      to: formattedTo,
      bcc: formattedBcc,
      subject: subject || "Urgent: Low Attendance Warning Notice",
      htmlbody,
    };

    if (instructorEmail) {
      payload.reply_to = [
        { address: instructorEmail, name: instructorName || "Course Instructor" },
      ];
    }

    const response = await axios.post("/api/send-email", payload, {
      headers: { "Content-Type": "application/json" },
    });

    return {
      success: true,
      data: response.data,
      recipientCount: (formattedTo.length || 0) + (formattedBcc.length || 0),
    };
  } catch (error) {
    console.error("sendZeptoMail error:", error);
    let message = "Failed to send email via ZeptoMail";
    const errData = error.response?.data?.error || error.response?.data;
    if (errData) {
      if (typeof errData === "string") {
        message = errData;
      } else if (errData.message) {
        message = errData.message;
        if (Array.isArray(errData.details) && errData.details.length > 0) {
          const detailMsg = errData.details
            .map((d) => d.message || JSON.stringify(d))
            .join(", ");
          message = `${message}: ${detailMsg}`;
        }
      } else {
        message = JSON.stringify(errData);
      }
    } else if (error.message) {
      message = error.message;
    }

    return {
      success: false,
      error: message,
    };
  }
};

/**
 * Test sending an email via ZeptoMail to a test recipient
 */
export const testZeptoMail = async (testRecipient = "noreply@gkv.ac.in") => {
  return await sendZeptoMail({
    to: testRecipient,
    subject: "GKVFlow ZeptoMail Integration Test",
    bodyContent:
      "This is a confirmation test email from GKVFlow-PMS.\n\nYour ZeptoMail API integration has been successfully configured and verified.",
    courseName: "System Diagnostics",
  });
};

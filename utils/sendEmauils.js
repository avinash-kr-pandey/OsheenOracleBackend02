import dotenv from "dotenv";
dotenv.config();

/**
 * Sends an email using the MSG91 Email API.
 * Falls back to console logs in development/fallback mode if MSG91_AUTHKEY is not provided.
 *
 * Supports two signatures:
 * 1. Legacy/simple: sendEmail(email, subject, message)
 * 2. Object parameter: sendEmail({ email, name, subject, message, templateId, variables })
 */
export const sendEmail = async (param1, param2, param3) => {
  let email, name, subject, message, templateId, variables;

  if (typeof param1 === "object" && param1 !== null) {
    // Object-based signature
    email = param1.email;
    name = param1.name || "";
    subject = param1.subject || "";
    message = param1.message || "";
    templateId = param1.templateId;
    variables = param1.variables || {};
  } else {
    // Legacy positional signature
    email = param1;
    subject = param2 || "";
    message = param3 || "";
    name = "";
    templateId = undefined;
    variables = {};
  }

  const authKey = process.env.MSG91_AUTHKEY;
  const fromEmail = process.env.MSG91_FROM_EMAIL || "no-reply@osheenoracle.com";
  const fromName = process.env.MSG91_FROM_NAME || "Osheen Oracle";
  const domain = process.env.MSG91_DOMAIN || "osheenoracle.com";

  // Fallback template ID for password reset if subject matches and no template ID is explicitly provided
  if (!templateId && subject && subject.toLowerCase().includes("reset password")) {
    templateId = process.env.MSG91_RESET_PASSWORD_TEMPLATE_ID;
  }

  // If no auth key is configured, log to console as fallback (great for development)
  if (!authKey) {
    console.log("⚠️ MSG91_AUTHKEY is not configured. Falling back to console logging.");
    console.log(`[EMAIL SEND SIMULATION]`);
    console.log(`To: ${email} ${name ? `(${name})` : ""}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    if (templateId) console.log(`Template ID: ${templateId}`);
    if (Object.keys(variables).length > 0) console.log(`Variables:`, variables);
    return true;
  }

  try {
    // MSG91 Email API mandatorily requires a template_id
    if (!templateId) {
      console.warn("⚠️ Sending email via MSG91 API requires a template_id, but none was provided. Attempting to use MSG91_RESET_PASSWORD_TEMPLATE_ID.");
      templateId = process.env.MSG91_RESET_PASSWORD_TEMPLATE_ID;
      
      if (!templateId) {
        throw new Error("MSG91 Email API requires a template_id to send emails, and neither explicit templateId nor MSG91_RESET_PASSWORD_TEMPLATE_ID was provided.");
      }
    }

    // Prepare standard variables. If variables are empty, map some defaults:
    const mergedVariables = {
      message: message,
      subject: subject,
      ...variables
    };

    // If variables doesn't contain a name or email, pass them as variables too
    if (!mergedVariables.name && name) mergedVariables.name = name;
    if (!mergedVariables.email) mergedVariables.email = email;

    // Check if the legacy message contains the reset-password URL and extract it,
    // so that we can pass it as a template variable
    if (!mergedVariables.reset_url && !mergedVariables.resetUrl && message) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const match = message.match(urlRegex);
      if (match && match[0]) {
        mergedVariables.reset_url = match[0];
        mergedVariables.resetUrl = match[0];
      }
    }

    // Quick fix: Map template variables for OTP templates if reset link is sent
    if (templateId === "otp_template_34" || templateId === process.env.MSG91_RESET_PASSWORD_TEMPLATE_ID) {
      if (!mergedVariables.company_name) mergedVariables.company_name = "Osheen Oracle";
      if (!mergedVariables.otp) {
        mergedVariables.otp = mergedVariables.reset_url || mergedVariables.resetUrl || message;
      }
    }

    const payload = {
      recipients: [
        {
          to: [
            {
              email: email,
              name: name || email.split("@")[0]
            }
          ],
          variables: mergedVariables
        }
      ],
      from: {
        email: fromEmail,
        name: fromName
      },
      domain: domain,
      template_id: templateId
    };

    console.log(`📤 Sending email to ${email} using MSG91 Template ID ${templateId}...`);

    const response = await fetch("https://control.msg91.com/api/v5/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authkey": authKey
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { rawText: responseText };
    }

    if (!response.ok || responseData.hasError || responseData.status === "error") {
      throw new Error(responseData.message || responseData.msg || JSON.stringify(responseData));
    }

    console.log(`✅ Email sent successfully to ${email} via MSG91!`, responseData);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${email} via MSG91:`, error.message);
    throw error;
  }
};


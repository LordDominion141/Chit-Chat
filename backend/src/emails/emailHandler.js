import { sendEmailViaGmailAPI, sender } from "../lib/nodemailer.js"; 
import { createWelcomeEmailTemplate } from "./emailTemplate.js";

export const sendWelcomeEmail = async (email, name, clientUrl) => {
  try {
    const mailOptions = {
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Welcome to Chit-Chat",
      html: createWelcomeEmailTemplate(name, clientUrl),
    };

    console.log(`[MAIL DEBUG] Preparing API payload for: ${email}`);
    const data = await sendEmailViaGmailAPI(mailOptions);
    console.log("[MAIL] Welcome email sent successfully via Gmail REST API", { messageId: data.id });
    return data;
  } catch (error) {
    console.error("[MAIL ERROR] Gmail API execution failed inside handler:", error?.message || error);
    throw error;
  }
};

import nodemailer from "nodemailer";
import { ENV } from "./env.js";

export const sendEmailViaNodemailer = async (mailOptions) => {
  // Create transporter dynamically on request to avoid frozen pool issues
  const mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: ENV.GMAIL_USER,
      clientId: ENV.GOOGLE_CLIENT_ID,
      clientSecret: ENV.GOOGLE_CLIENT_SECRET,
      refreshToken: ENV.GOOGLE_REFRESH_TOKEN,
    },
    // Add a strict timeout so it doesn't hang indefinitely
    connectionTimeout: 10000, 
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  // Verify connection configuration before attempting to send
  console.log("[MAIL DEBUG] Verifying OAuth2 connection to Gmail...");
  await mailTransporter.verify();
  console.log("[MAIL DEBUG] OAuth2 credentials verified successfully!");

  // Send the email
  return await mailTransporter.sendMail(mailOptions);
};

export const sender = {
  email: ENV.GMAIL_USER,
  name: ENV.EMAIL_FROM_NAME || "Chit-Chat"
};

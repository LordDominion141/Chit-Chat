import { google } from "googleapis";
import { ENV } from "./env.js";

export const sendEmailViaGmailAPI = async (mailOptions) => {
  const OAuth2 = google.auth.OAuth2;
  
  const oauth2Client = new OAuth2(
    ENV.GOOGLE_CLIENT_ID,
    ENV.GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: ENV.GOOGLE_REFRESH_TOKEN,
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  // Compile the RFC 2822 raw internet message structure Google expects
  const emailLines = [
    `From: ${mailOptions.from}`,
    `To: ${mailOptions.to}`,
    `Subject: ${mailOptions.subject}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    "",
    mailOptions.html,
  ];
  
  // Convert standard strings into safe base64 URL-encoded formats
  const rawEmail = Buffer.from(emailLines.join("\r\n"))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  console.log("[MAIL DEBUG] Sending via Direct HTTPS Gmail REST API...");
  
  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: rawEmail,
    },
  });

  return response.data;
};

export const sender = {
  email: ENV.GMAIL_USER,
  name: ENV.EMAIL_FROM_NAME || "Chit-Chat"
};

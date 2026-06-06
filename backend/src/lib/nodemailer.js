import nodemailer from "nodemailer";
import { ENV } from "./env.js";

// Create the transport configuration using OAuth2 authentication to bypass Render's SMTP block
export const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: ENV.GMAIL_USER,
    clientId: ENV.GOOGLE_CLIENT_ID,
    clientSecret: ENV.GOOGLE_CLIENT_SECRET,
    refreshToken: ENV.GOOGLE_REFRESH_TOKEN,
  },
});

export const sender = {
  email: ENV.GMAIL_USER,
  name: ENV.EMAIL_FROM_NAME || "Chit-Chat"
};

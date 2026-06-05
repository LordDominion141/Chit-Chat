import nodemailer from "nodemailer";
import { ENV } from "./env.js";

// Create the reusable transport configuration using Gmail's SMTP service
export const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: ENV.GMAIL_USER,      // Your personal Gmail address
    pass: ENV.GMAIL_APP_PASS,  // Your 16-character Google App Password
  },
});

export const sender = {
  email: ENV.GMAIL_USER,
  name: ENV.EMAIL_FROM_NAME || "Chit-Chat"
};

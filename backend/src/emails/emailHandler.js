// Change this import to pull from your new nodemailer configuration file
import { mailTransporter, sender } from "../lib/nodemailer.js"; 
import { createWelcomeEmailTemplate } from "../emails/emailTemplate.js";

export const sendWelcomeEmail = async (email, name, clientUrl) => {
  try {
    const mailOptions = {
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Welcome to Chit-Chat",
      html: createWelcomeEmailTemplate(name, clientUrl),
      text: "Hello",
    };

    // Send the email using Nodemailer
    const info = await mailTransporter.sendMail(mailOptions);
    
    console.log("Welcome email sent successfully via Gmail", { messageId: info.messageId });
  } catch (error) {
    console.error("Welcome email execution failed:", error);
    throw new Error(error?.message || "Welcome email send failed");
  }
};

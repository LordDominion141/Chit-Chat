import { sendEmailViaNodemailer, sender } from "../lib/nodemailer.js"; 
import { createWelcomeEmailTemplate } from "../emails/emailTemplate.js";

export const sendWelcomeEmail = async (email, name, clientUrl) => {
  try {
    console.log(`[MAIL DEBUG] Constructing template for ${email}`);
    
    const mailOptions = {
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Welcome to Chit-Chat",
      html: createWelcomeEmailTemplate(name, clientUrl),
      text: "Hello",
    };

    // Use our new dynamic function
    const info = await sendEmailViaNodemailer(mailOptions);
    
    console.log("Welcome email sent successfully via Gmail", { messageId: info.messageId });
    return info;
  } catch (error) {
    console.error("Welcome email execution failed inside handler:", error);
    throw error; // Let the controller catch it
  }
};

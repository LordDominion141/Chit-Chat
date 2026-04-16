import { resendClient, sender } from "../lib/resend.js";
import {createWelcomeEmailTemplate} from "../emails/emailTemplate.js";
import { ENV } from "../lib/env.js"


export const sendWelcomeEmail = async (email, name, clientUrl) => {
    const {data, error} = await  resendClient.emails.send({
        from: `${sender.name} <${sender.email}>`,
        to: email,
        subject: "Welcome to Chit-Chat",
        html: createWelcomeEmailTemplate(name, clientUrl),
        text: "Hello"
        
    })
    
    if(error){
        console.log("Something went wrong man", error);
    } else{
        console.log("Success 💥💥💥💥", data)
    }
}
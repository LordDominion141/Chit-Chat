import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from '../lib/utils.js';
import {sendWelcomeEmail} from "../emails/emailHandler.js";
import { ENV } from "../lib/env.js"
//Defining functions
export const signupRes = async (req, res)=>{
    const {fullName, email, password} = req.body;

    try {
        if(!fullName || !email || !password){
            return res.status(400).json({message:"All fields are required"});
        }
        if(password.length < 6){
            return res.status(400).json({message:"Password must be at least 6 characters"})
        }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
        
        if(!emailRegex.test(email)){
            return res.status(400).json({message:"Invalid email format."})
        }
    const user = await User.findOne({email});
    if(user) {
        console.log("User already exists ")
        return res.status(400).json({message:"User already exists."})
        
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = new User({
        fullName,
        email,
        password: hashedPassword
    });
    
    if(newUser){
        await newUser.save();
        generateToken(newUser._id, res);
        console.log("New user created")
        
       void sendWelcomeEmail(newUser.email, newUser.fullName, ENV.CLIENT_URL)
            .catch((e) => {
                console.error("Failed to send welcome email", { message: e?.message });
            });
    
        
        return res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            profilePic: newUser.profilePic
        })
        
    
    }else{
        res.status(400).json({message:"Invalid user data"})
    }
    
    
    
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({
                
        message: "User already exists." 
                
            });
}

        console.log("Error in sign up", error);
        return res.status(500).json({
             message:"Something went wrong "
        })
    }
}
export const loginRes = (req, res)=>{
    res.send("Log in page");
}
export const logoutRes = (req, res)=>{
    res.send("Log out page");
}

const authControl = {
    signupRes,
    loginRes,
    logoutRes
};

export default authControl;

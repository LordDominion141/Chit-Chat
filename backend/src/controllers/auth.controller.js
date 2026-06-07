import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from '../lib/utils.js';
import { sendWelcomeEmail } from "../emails/emailHandler.js";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";

export const signupRes = async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format." });
        }

        const user = await User.findOne({ email });
        if (user) {
            console.log("User already exists ");
            return res.status(400).json({ message: "User already exists." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });

        if (newUser) {
            await newUser.save();
            generateToken(newUser._id, res);
            console.log(`[SIGNUP] Database entry created for: ${newUser.email}`);

            // Await execution safely so the Render server instance doesn't close prematurely
            try {
                await sendWelcomeEmail(newUser.email, newUser.fullName, ENV.CLIENT_URL);
                console.log(`[MAIL] Sync pipeline finished for ${newUser.email}`);
            } catch (mailError) {
                console.error("[MAIL ERROR] Background execution crashed:", mailError?.message || mailError);
            }

            return res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic
            });
        } else {
            return res.status(400).json({ message: "Invalid user data" });
        }

    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ message: "User already exists." });
        }
        console.log("Error in sign up", error);
        return res.status(500).json({ message: "Something went wrong " });
    }
};

export const loginRes = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        generateToken(user._id, res);

        return res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic
        });
    } catch (e) {
        console.log("Error during login: ", e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const logoutRes = async (_, res) => {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "Logout successfully" });
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        if (!profilePic) return res.status(400).json({ message: "Profile Picture Required." });
        const userId = req.user._id;

        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        ).select("-password");

        return res.status(200).json(updatedUser);
    } catch (e) {
        console.log("Error in updateProfile: ", e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const authControl = {
    signupRes,
    loginRes,
    logoutRes,
    updateProfile
};

export default authControl;

import jwt from 'jsonwebtoken';
import { ENV } from "./env.js"

export const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, ENV.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true, // keeps it safe from JS
        sameSite: "Lax", // "Lax" is much better for testing than "Strict"
        secure: false,   // CRITICAL: Set to false so it works over http://
    });

    return token;
};

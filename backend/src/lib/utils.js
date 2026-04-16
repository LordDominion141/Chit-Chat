import jwt from 'jsonwebtoken';
import { ENV } from "./env.js"

export const generateToken = (userId, res)=>{
    const secret = ENV.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }
    const token = jwt.sign({ userId }, secret, { expiresIn: "7d" });
    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "Strict",
        secure: ENV.NODE_ENV === "production"? true: false
    })
    
    return token;
}
import jwt from 'jsonwebtoken';

export const generateToken = (userId, res)=>{
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }
    const token = jwt.sign({ userId }, secret, { expiresIn: "7d" });
    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "Strict",
        secure: process.env.NODE_ENV === "production"? true: false
    })
    
    return token;
}
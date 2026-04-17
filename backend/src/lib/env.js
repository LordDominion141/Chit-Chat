import "dotenv/config"

const requiredEnv = [
  "MONGO_URL",
  "JWT_SECRET",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "EMAIL_FROM_NAME",
  "CLIENT_URL",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const ENV = {
    PORT: process.env.PORT,
    MONGO_URL: process.env.MONGO_URL,
    NODE_ENV: process.env.NODE_ENV,
    JWT_SECRET: process.env.JWT_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
    CLIENT_URL: process.env.CLIENT_URL,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
}

/*
PORT=3000
MONGO_URL=mongodb+srv://domweb141_db_user:glS01bkpqauUB2GZ@cluster0.rzcpwth.mongodb.net/chit-chat_db?appName=Cluster0
NODE_ENV=development
JWT_SECRET=myjwtsecret
RESEND_API_KEY=re_TxXih4cW_CC24GxDpdombhkgNGev1hdom
EMAIL_FROM=onboarding@resend.dev
EMAIL_FROM_NAME=Dominion Okori
CLIENT_URL=https://chit-chat-1-vd5n.onrender.com
*/
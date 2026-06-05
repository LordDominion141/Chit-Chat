import "dotenv/config";

const requiredEnv = [
  "MONGO_URL",
  "JWT_SECRET",
  "CLIENT_URL",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "ARCJET_KEY",
  "GMAIL_USER",
  "GMAIL_APP_PASS",
  "EMAIL_FROM_NAME"
];

// Validate that all strictly required variables exist
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const ENV = {
  // Dynamically assigned by hosting platforms or defaults
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  ARCJET_ENV: process.env.ARCJET_ENV,

  // Strictly required database and auth config
  MONGO_URL: process.env.MONGO_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  CLIENT_URL: process.env.CLIENT_URL,

  // Cloudinary storage config
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  // Security config
  ARCJET_KEY: process.env.ARCJET_KEY,

  // Nodemailer/Gmail email configuration 
  GMAIL_USER: process.env.GMAIL_USER,
  GMAIL_APP_PASS: process.env.GMAIL_APP_PASS,
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME
};

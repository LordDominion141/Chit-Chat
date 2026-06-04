// Import tools/dependencies
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";

import cookieParser from "cookie-parser";
import cors from "cors";

// Initialize app
const app = express();

// ✅ FIX: correct __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Port
const PORT = ENV.PORT || 3000;

// Middleware
app.use(express.json({ limit: "5mb" }));

app.use(
    cors({
        origin: ENV.CLIENT_URL,
        credentials: true,
    })
);

app.use(cookieParser());

// Debug middleware
app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);

    if (ENV.NODE_ENV !== "production") {
        console.log("Cookies attached:", Object.keys(req.cookies ?? {}));
    }

    next();
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// =======================
// 🚀 Serve frontend in production
// =======================
if (ENV.NODE_ENV === "production") {
    const distPath = path.resolve("frontend/dist");

    if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));

        app.get("*", (req, res) => {
            res.sendFile(path.join(distPath, "index.html"));
        });
    } else {
        console.log("❌ FRONTEND DIST NOT FOUND:", distPath);
    }
}

// Start server
const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log("Server running on port " + PORT);
    });
};

startServer();
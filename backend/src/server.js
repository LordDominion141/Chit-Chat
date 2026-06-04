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

const app = express();

// FIXED __dirname (required for Render + ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Port
const PORT = ENV.PORT || 3000;

// Middleware
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

// Logger
app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    next();
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// =======================
// FRONTEND SERVING (PRODUCTION)
// =======================

// =======================
// 🚀 Serve frontend in production
// =======================

if (ENV.NODE_ENV === "production") {
    const distPath = path.resolve(__dirname, "../dist");

    console.log("Serving frontend from:", distPath);

    if (!fs.existsSync(distPath)) {
        console.log("❌ FRONTEND DIST NOT FOUND:", distPath);
    } else {
        app.use(express.static(distPath));

        app.get(/.*/, (req, res) => {
            res.sendFile(path.join(distPath, "index.html"));
        });
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
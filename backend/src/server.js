// Import tools/dependencies
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";

import cookieParser from "cookie-parser";
import cors from "cors";

// Initialize app
const app = express();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


console.log("🔥 SERVER STARTED FILE:", import.meta.url);
console.log("🔥 NODE_ENV:", ENV.NODE_ENV);

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
    const distPath = path.join(__dirname, "../frontend/dist");

    console.log("Serving frontend from:", distPath);

    app.use(express.static(distPath));

    app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
    });
}
// Start server
const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log("Server running on port " + PORT);
    });
};

startServer();
// Import tools/dependencies
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import express from "express"; 
import cors from "cors"; 

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";

import cookieParser from "cookie-parser";
import { app, server } from "./lib/socket.js"; 


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Port
const PORT = ENV.PORT || 3000;

//implement cors
app.use(cors({
    origin: ENV.NODE_ENV === "production" ? false : "http://localhost:5173",
    credentials: true,
}));


app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());


app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    next();
});

//routes

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// SERVING THE FRONTEND (IN PRODUCTION)
if (ENV.NODE_ENV === "production") {
    const distPath = path.resolve(__dirname, "../../frontend/dist");
    console.log("Serving frontend from:", distPath);

    if (!fs.existsSync(distPath)) {
        console.log("❌ FRONTEND DIST NOT FOUND!!!!:", distPath);
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
    server.listen(PORT, () => {
        console.log("Server running with Socket.io capabilities on port " + PORT);
    });
};

startServer();

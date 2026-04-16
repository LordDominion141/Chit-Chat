//Import tools/dependencies.
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import { connectDB } from './lib/db.js';
import { ENV } from "./lib/env.js"
//Initialize our server.
const app = express();


const __dirname = path.resolve();


//Get or port no. from .env file.
const PORT = ENV.PORT || 3000;

//Whatever this does. 🤣🤣🤣 Just kidding
//Initialize our API URL, and use our requests from the requests file.


app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)


//Make ready for deployment.
if(ENV.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
    app.use((req, res)=>{
        res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
    });
}


//Listen for request
const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log("Server running on port " + PORT);
    });
};

startServer();
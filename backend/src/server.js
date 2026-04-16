//Import tools/dependencies.
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import { connectDB } from './lib/db.js'
//Initialize our server.
const app = express();


const __dirname = path.resolve();


//Get or port no. from .env file.
dotenv.config();
const PORT = process.env.PORT || 3000;

//Whatever this does. 🤣🤣🤣 Just kidding
//Initialize our API URL, and use our requests from the requests file.


app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)


//Make ready for deployment.
if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
    app.use((req, res)=>{
        res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
    });
}


//Listen for request
app.listen(PORT, ()=>{
    console.log("Server running on port "+PORT);
    connectDB();
    
});
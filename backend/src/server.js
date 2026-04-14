//Import tools/dependencies.
const express = require('express');
const dotenv = require('dotenv')
const authRoutes = require('./routes/auth.route.js')
const messageRoutes = require('./routes/message.route.js')

//Initialize our server.
const app = express();

//Get or port no. from .env file.
dotenv.config();
const port = process.env.PORT || 3000;

//Whatever this does. 🤣🤣🤣 Just kidding
//Initialize our API URL, and use our requests from the requests file.


app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)


//Listen for request
app.listen(port, () =>{ console.log('Chit-chat server running now...')});
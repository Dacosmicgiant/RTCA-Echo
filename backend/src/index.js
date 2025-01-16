// const express = require("express") //import express using commonjs
import express from "express"; //import using module instead of commonjs i.e   "type": "module", //in package.json
// gives extra features to build API easily ex routes, middlewares, etc
import dotenv from "dotenv";

import cookieParser from "cookie-parser";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import cors from "cors";

dotenv.config()
const app = express(); //create express app
// const cors = require("cors");

const PORT = process.env.PORT

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credential: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.listen(5001, () => {
    console.log("server is running on PORT: "+ PORT);
    connectDB();
    //prompts this in console once server starts
    // to run this, we create a script in package.json
    // "scripts": {
    // "dev": "nodemon index.js"
    // },
})
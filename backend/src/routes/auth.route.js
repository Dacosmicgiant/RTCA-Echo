import express from "express";
import { login, logout, signup } from "../controllers/auth.controller.js";

const router = express.Router();

// Define the route handlers correctly
//functions to handle routes defined in controllers
router.post("/signup", signup );

router.post("/login", login);

router.post("/logout", logout);

export default router;

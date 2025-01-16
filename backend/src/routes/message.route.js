import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUsersForSidebar, getMessages, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/user", protectRoute, getUsersForSidebar); // Get users for sidebar
router.get("/:id", protectRoute, getMessages); // Get messages for a specific user
router.post("/send/:id", protectRoute, sendMessage); // Send a message to a specific user

export default router;

import { Router } from "express";
import { addMessageController, getMessagesController } from "../controllers/message.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// Add message to a prompt/room
router.post("/add", authMiddleware, addMessageController);

// Get all messages for a specific prompt/room
router.get("/get", authMiddleware, getMessagesController);

export default router; 
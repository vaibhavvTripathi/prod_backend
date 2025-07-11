import { Router } from "express";
import { streamChat } from "../controllers/ai.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// POST /api/v0.1/ai/chat - Protected by authentication
router.post("/chat", authMiddleware, streamChat);

export default router;

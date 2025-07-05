import { Router } from "express";
import { streamChat } from "../controllers/ai.controller";

const router = Router();

// POST /api/v0.1/ai/gemini
router.post("/", streamChat);

export default router;

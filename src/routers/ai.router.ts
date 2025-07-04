import { Router } from "express";
import { handleGeminiRequest } from "../controllers/ai.controller";

const router = Router();

// POST /api/v0.1/ai/gemini
router.post("/", handleGeminiRequest);

export default router;

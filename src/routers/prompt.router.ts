import { Router } from "express";
import { createPromptController } from "../controllers/prompt.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authMiddleware, createPromptController);

export default router; 
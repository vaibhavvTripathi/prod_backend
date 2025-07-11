import { Request, Response } from "express";
import { createPrompt } from "../services/prompt.service";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

export async function createPromptController(req: AuthenticatedRequest, res: Response) {
  try {
    const { prompt } = req.body;
    const userId = req.user?.userId;
    if (!userId || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing userId or prompt" });
    }
    const result = await createPrompt({ prompt, userId });
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create prompt", details: error instanceof Error ? error.message : error });
  }
} 
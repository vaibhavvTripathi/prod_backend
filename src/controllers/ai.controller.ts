import { Request, Response } from "express";
import { getGeminiResponse } from "../services/ai.service";

export const handleGeminiRequest = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    const response = await getGeminiResponse(prompt);
    res.status(200).json({ response });
  } catch (error) {
    res.status(500).json({ error: "Failed to communicate with Gemini LLM" });
  }
}; 
import { Response } from "express";
import { streamChatService } from "../services/ai.service";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

interface ChatRequest {
  message: string;
  promptId: number;
}

export const streamChat = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { message, promptId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Missing or invalid message" });
      return;
    }

    if (!promptId || typeof promptId !== "number") {
      res.status(400).json({ error: "Missing or invalid promptId" });
      return;
    }

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    await streamChatService(message, promptId, userId, (chunk: string) => {
      res.write(chunk);
    });

    res.end();
  } catch (error) {
    res.status(500).json({ error: "Failed to communicate with Gemini LLM" });
  }
};

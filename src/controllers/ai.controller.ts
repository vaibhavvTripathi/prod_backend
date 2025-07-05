import { Request, Response } from "express";
import { streamChatService } from "../services/ai.service";

interface ChatRequest {
  message: string;
  sessionId: string;
}

export const streamChat = async (
  req: Request<{}, {}, ChatRequest>,
  res: Response
): Promise<void> => {
  try {
    const { message } = req.body;

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    await streamChatService(message, (chunk: string) => {
      console.log(chunk);
      res.write(chunk);
    });

    res.end();
  } catch (error) {
    res.status(500).json({ error: "Failed to communicate with Gemini LLM" });
  }
};

import { Response } from "express";
import { addMessage, getMessagesByPromptId } from "../services/message.service";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

export async function addMessageController(req: AuthenticatedRequest, res: Response) {
  try {
    const { promptId, message, role } = req.body;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    
    if (!promptId || typeof promptId !== "number") {
      return res.status(400).json({ error: "Missing or invalid promptId" });
    }
    
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing or invalid message" });
    }
    
    if (!role || (role !== "user" && role !== "model")) {
      return res.status(400).json({ error: "Missing or invalid role. Must be 'user' or 'model'" });
    }
    
    const result = await addMessage({ promptId, message, userId, role });
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ 
      error: "Failed to add message", 
      details: error instanceof Error ? error.message : error 
    });
  }
}

export async function getMessagesController(req: AuthenticatedRequest, res: Response) {
  try {
    const promptId = parseInt(req.query.promptId as string);
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    
    if (!promptId || isNaN(promptId)) {
      return res.status(400).json({ error: "Missing or invalid promptId query parameter" });
    }
    
    const messages = await getMessagesByPromptId({ promptId, userId });
    return res.json({ messages });
  } catch (error) {
    return res.status(500).json({ 
      error: "Failed to get messages", 
      details: error instanceof Error ? error.message : error 
    });
  }
} 
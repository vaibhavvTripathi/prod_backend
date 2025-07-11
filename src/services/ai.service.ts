import { getGenAI } from "./genai.service";
import { getMessagesByPromptId } from "./message.service";
import fs from "fs";
import path from "path";

const systemPromptPath = path.join(__dirname, "../prompt/system-prompt.txt");
const systemPrompt = fs.readFileSync(systemPromptPath, "utf-8");

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export const streamChatService = async (
  message: string,
  promptId: number,
  userId: number,
  onChunk: (chunk: string) => void
): Promise<void> => {
  try {
    const ai = getGenAI();
    
    // Get chat history from message service
    const messages = await getMessagesByPromptId({ promptId, userId });
    
    // Convert messages to ChatMessage format
    const history: ChatMessage[] = messages.map((msg) => ({
      role: msg.role,
      content: msg.message,
    }));

    const contents = [
      { role: "model", parts: [{ text: systemPrompt }] },
      ...history.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    const response = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents,
    });

    let assistantResponse = "";
    for await (const chunk of response) {
      const text = chunk.text;
      if (text) {
        assistantResponse += text;
        onChunk(text);
      }
    }

    // TODO: Save updated chat history to Redis with sessionId
    // history.push({ role: 'user', content: message });
    // history.push({ role: 'model', content: assistantResponse });
  } catch (error) {
    console.log(error);
    throw new Error("Error communicating with Gemini LLM");
  }
};

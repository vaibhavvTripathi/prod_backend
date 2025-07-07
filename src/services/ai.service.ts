import { getGenAI } from "./genai.service";
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
  onChunk: (chunk: string) => void
): Promise<void> => {
  try {
    const ai = getGenAI();
    // TODO: Get chat history from Redis using sessionId
    const history: ChatMessage[] = [];

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

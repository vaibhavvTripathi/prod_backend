import { getGenAI } from "./genai.service";
import { getSystemPrompt } from "../prompt/system_prompt";

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export const streamChatService = async (
  message: string, 
  onChunk: (chunk: string) => void
): Promise<void> => {
  try {
    const ai = getGenAI();
    const systemPrompt = getSystemPrompt();
    
    // TODO: Get chat history from Redis using sessionId
    const history: ChatMessage[] = [];
    
    const contents = [
      { role: "model", parts: [{ text: systemPrompt }] },
      ...history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      })),
      { role: "user", parts: [{ text: message }] }
    ];
    
    const response = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents
    });
    
    let assistantResponse = '';
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
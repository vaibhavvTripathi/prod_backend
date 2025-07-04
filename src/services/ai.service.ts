import { getGenAI } from "./genai.service";
import { getSystemPrompt } from "../prompt/system_prompt";

export const getGeminiResponse = async (prompt: string): Promise<string> => {
  try {
    const ai = getGenAI();
    const systemPrompt = getSystemPrompt();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "model", parts: [{ text: systemPrompt }] },
        { role: "user", parts: [{ text: prompt }] },
      ],
    });
    return response.text || "";
  } catch (error) {
    console.log(error);
    throw new Error("Error communicating with Gemini LLM");
  }
};

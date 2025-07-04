import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | undefined = undefined;

export const getGenAI = () => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
};

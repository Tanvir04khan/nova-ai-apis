import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env";

if (!env.GEMINI_API_KEY) {
  console.log("Missing Gemini API Key.");
  throw Error("internal server error.");
}

const ai = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});

export type GeminiModels =
  | "gemini-2.5-flash"
  | "gemini-3.5-flash"
  | "gemini-3.1-pro"
  | "gemini-3-flash"
  | "gemini-1.5-flash"
  | "gemini-2.5-flash-lite";

export const generateGeminiStream = async (
  message: {
    role: "user" | "model";
    parts: {
      text: string;
    }[];
  }[],
  model: GeminiModels,
  onChunk: (text: string) => void,
) => {
  const stream = await ai.models.generateContentStream({
    model,
    contents: message,
  });

  for await (const chunk of stream) {
    onChunk(chunk.text ?? "");
  }
};

export const generateGeminiContent = async (
  message: string,
  model: GeminiModels,
) => {
  const response = await ai.models.generateContent({
    model,
    contents: message,
  });

  return response.text;
};

import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = "AIzaSyBEJtHM6Srp0AK2VcV3Glr1Ewikpgqhw2I";
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function getAIResponse(messages: { role: string; content: string }[], systemInstruction: string) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: messages.map(m => ({
      role: m.role === "ai" ? "model" : "user",
      parts: [{ text: m.content }]
    })),
    config: {
      systemInstruction,
    }
  });

  const response = await model;
  return response.text || "抱歉，我没听清楚，请再说一遍。";
}

export async function getInterviewFeedback(messages: { role: string; content: string }[]) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: "根据以下面试对话，提供评分（0-100）、3个优势、2个待提升项和一段总结。对话内容：" + JSON.stringify(messages) }]
      }
    ],
    config: {
      responseMimeType: "application/json",
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return null;
  }
}

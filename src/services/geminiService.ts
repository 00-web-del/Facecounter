import { GoogleGenAI } from "@google/genai";
const GEMINI_API_KEY = "AIzaSyBEJtHM6Srp0AK2VcV3Glr1Ewikpgqhw2I";
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function getAIResponse(messages: { role: string; content: string }[], systemInstruction: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: messages.map(m => ({
        role: m.role === "ai" ? "model" : "user",
        parts: [{ text: m.content }]
      })),
      config: {
        systemInstruction,
      }
    });
    return response.text || "抱歉，我没听清楚，请再说一遍。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "抱歉，AI 服务暂时不可用，请稍后再试。";
  }
}

export async function getInterviewFeedback(messages: { role: string; content: string }[]) {
  try {
    const feedbackPrompt = "请根据以下面试对话，提供详细的反馈，包括优势和改进点。";
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: "user", parts: [{ text: feedbackPrompt }] },
        ...messages.map(m => ({
          role: m.role === "ai" ? "model" : "user",
          parts: [{ text: m.content }]
        }))
      ],
    });
    return { feedback: { text: response.text || "无法生成反馈" } };
  } catch (error) {
    console.error("Feedback API Error:", error);
    return { feedback: { text: "无法生成反馈，请稍后再试。" } };
  }
}

import { Type } from "@google/genai";

export enum Screen {
  HOME = "HOME",
  LOGIN = "LOGIN",
  SIGNUP = "SIGNUP",
  ONBOARDING = "ONBOARDING",
  SETUP = "SETUP",
  INTERVIEW = "INTERVIEW",
  RESULT = "RESULT",
  ANALYSIS = "ANALYSIS",
  QUESTION_BANK = "QUESTION_BANK",
  SETTINGS = "SETTINGS",
}

export interface UserProfile {
  name: string;
  currentJob: string;
  targetJob: string;
  experience: string;
  industry?: string;
}

export interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: string;
}

export interface Interview {
  id: string;
  role: string;
  status: "COMPLETED" | "DRAFT";
  score?: number;
  duration?: string;
  questionsCount?: number;
  strengths?: string[];
  improvements?: string[];
  messages?: Message[];
}

export const INTERVIEW_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    feedback: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.NUMBER },
        strengths: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        improvements: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        summary: { type: Type.STRING }
      },
      required: ["score", "strengths", "improvements", "summary"]
    }
  },
  required: ["feedback"]
};

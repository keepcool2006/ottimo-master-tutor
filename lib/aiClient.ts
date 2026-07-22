import Groq from "groq-sdk";
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";

/**
 * Returns a Groq client instance if GROQ_API_KEY is present in env.
 */
export function getGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  return new Groq({ apiKey });
}

/**
 * Returns a GoogleGenerativeAI instance if GEMINI_API_KEY is present in env.
 */
export function getGeminiClient(): GoogleGenerativeAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
}

export const GROQ_MODEL = "llama-3.3-70b-versatile";

// Safety settings for Gemini
export const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

/** Embedding helper — uses Gemini text-embedding-004 if available, or local fallback */
export async function embedText(text: string): Promise<number[]> {
  const gemini = getGeminiClient();
  if (gemini) {
    try {
      const model = gemini.getGenerativeModel({ model: "text-embedding-004" });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch {
      // Fallback
    }
  }
  // Zero vector fallback if embeddings unavailable
  return new Array(768).fill(0);
}

/** Batch embed multiple texts */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  const gemini = getGeminiClient();
  if (gemini) {
    try {
      const model = gemini.getGenerativeModel({ model: "text-embedding-004" });
      const results = await Promise.all(texts.map((t) => model.embedContent(t)));
      return results.map((r) => r.embedding.values);
    } catch {
      // Fallback
    }
  }
  return texts.map(() => new Array(768).fill(0));
}

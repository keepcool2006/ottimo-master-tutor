import {
  GoogleGenerativeAI,
  GenerativeModel,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";

// Safety settings — relaxed for educational content (textbook discussions)
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

function getGenAI(): GoogleGenerativeAI {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Missing required environment variable: GEMINI_API_KEY");
  return new GoogleGenerativeAI(key);
}

/** Streaming chat model for Socratic tutoring */
export function getChatModel(): GenerativeModel {
  return getGenAI().getGenerativeModel({ model: "gemini-2.5-flash", safetySettings });
}

/** High-capability model for test paper generation */
export function getGenerationModel(): GenerativeModel {
  return getGenAI().getGenerativeModel({ model: "gemini-2.5-pro", safetySettings });
}

/** Embedding model for PDF chunks and query vectors */
export async function embedText(text: string): Promise<number[]> {
  const model = getGenAI().getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

/** Batch embed multiple texts efficiently */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  const model = getGenAI().getGenerativeModel({ model: "text-embedding-004" });
  const results = await Promise.all(texts.map((t) => model.embedContent(t)));
  return results.map((r) => r.embedding.values);
}

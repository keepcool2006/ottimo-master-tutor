import { NextRequest, NextResponse } from "next/server";
import { getGroqClient, getGeminiClient, GROQ_MODEL, embedText } from "@/lib/aiClient";
import { querySimilarChunks } from "@/lib/vectorStore";
import { buildTeacherPrompt } from "@/lib/socraticPrompt";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const maxDuration = 60;

export interface QuestionItem {
  id: string;
  type: "mcq" | "true_false" | "short_answer" | "long_answer";
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  marks: number;
}

interface GenerateTestRequest {
  bookId?: string;
  subject?: string;
  gradeLevel?: string;
  topic?: string;
  questionTypes: Array<"mcq" | "true_false" | "short_answer" | "long_answer">;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  count: number;
}

export async function POST(req: NextRequest) {
  try {
    try {
      const supabase = await createServerSupabaseClient();
      await supabase.auth.getUser();
    } catch {
      // Optional auth check for demo mode
    }

    const body: GenerateTestRequest = await req.json();
    const { bookId, subject, gradeLevel, topic, questionTypes, difficulty, count } = body;

    if (!questionTypes?.length || !count) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Retrieve relevant chunks using Supabase pgvector metadata filtering
    const queryText = topic ?? `${subject || "Science"} ${gradeLevel || "Grade 1"} key concepts`;
    let texts: string[] = [];
    try {
      const queryEmbedding = await embedText(queryText);
      const res = await querySimilarChunks(
        queryEmbedding,
        12,
        { bookId, subject, gradeLevel }
      );
      texts = res.texts;
    } catch (ragErr) {
      console.warn("Supabase pgvector query warning in quiz generation:", ragErr);
    }

    if (texts.length === 0) {
      texts = [
        `School curriculum content for ${subject || "Science"} (${gradeLevel || "Grade 1"}): plants, animals, living things, water cycle, energy.`,
      ];
    }

    // 2. Build teacher prompt
    const systemPrompt = buildTeacherPrompt(texts);

    const userPrompt = `Generate exactly ${count} questions with these requirements:
- Subject: ${subject || "General Science"}
- Grade Level: ${gradeLevel || "Grade 1"}
- Question types: ${questionTypes.join(", ")}
- Difficulty: ${difficulty}
- Topic focus: ${topic ?? "general chapter content"}

Return ONLY a valid JSON array matching this format:
[
  {
    "id": "q1",
    "type": "mcq",
    "difficulty": "easy",
    "question": "What part of the plant absorbs water from the soil?",
    "options": ["A. Leaf", "B. Flower", "C. Root", "D. Stem"],
    "answer": "C. Root",
    "explanation": "Roots grow underground and absorb water and nutrients from the soil.",
    "marks": 1
  }
]
No markdown, no explanation outside the JSON.`;

    const groq = getGroqClient();
    let raw = "";

    if (groq) {
      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 4096,
        response_format: { type: "json_object" },
      });

      raw = completion.choices[0]?.message?.content || "";
    } else {
      const gemini = getGeminiClient();
      if (!gemini) {
        return NextResponse.json({ error: "No AI provider key configured" }, { status: 500 });
      }
      const model = gemini.getGenerativeModel({ model: "gemini-2.5-pro" });
      const result = await model.generateContent({
        systemInstruction: systemPrompt,
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 8192, responseMimeType: "application/json" },
      });
      raw = result.response.text();
    }

    // 4. Parse and validate the JSON output
    let questions: QuestionItem[];
    try {
      const cleaned = raw.replace(/^```json\s*/m, "").replace(/```\s*$/m, "").trim();
      const parsed = JSON.parse(cleaned);
      questions = Array.isArray(parsed) ? parsed : (parsed.questions ?? parsed.data ?? []);
    } catch {
      console.error("JSON parse error — raw output:", raw.slice(0, 500));
      return NextResponse.json({ error: "Failed to parse generated questions" }, { status: 500 });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "Unexpected response format from AI" }, { status: 500 });
    }

    return NextResponse.json({ questions, count: questions.length });
  } catch (err: unknown) {
    console.error("Generate test error:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

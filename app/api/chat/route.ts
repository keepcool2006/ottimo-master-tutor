import { NextRequest } from "next/server";
import { getGroqClient, getGeminiClient, GROQ_MODEL, embedText } from "@/lib/aiClient";
import { querySimilarChunks } from "@/lib/vectorStore";
import { buildSocraticPrompt } from "@/lib/socraticPrompt";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";
export const maxDuration = 30;

interface ChatMessage {
  role: "user" | "assistant" | "model";
  parts?: [{ text: string }];
  content?: string;
}

export async function POST(req: NextRequest) {
  try {
    try {
      const supabase = await createServerSupabaseClient();
      await supabase.auth.getUser();
    } catch {
      // Optional auth check for demo mode
    }

    const {
      message,
      bookId = "science-g1",
      subject = "Science",
      gradeLevel = "Grade 1",
      history = [],
    }: {
      message: string;
      bookId?: string;
      subject?: string;
      gradeLevel?: string;
      history?: ChatMessage[];
    } = await req.json();

    if (!message?.trim()) {
      return new Response("Message is required", { status: 400 });
    }

    // 1. Retrieve relevant textbook chunks via Supabase Hybrid RAG
    let contextChunks: string[] = [];
    try {
      const queryEmbedding = await embedText(message);
      const { texts } = await querySimilarChunks(
        queryEmbedding,
        5,
        { bookId, subject, gradeLevel },
        message
      );
      contextChunks = texts;
    } catch (ragErr) {
      console.warn("Supabase RAG query warning:", ragErr);
    }

    // 2. Build Socratic system prompt with RAG context & book metadata
    const bookTitle = bookId === "science-g1" ? "Infinity Science - Book 1" : "Textbook";
    const systemPrompt = buildSocraticPrompt(contextChunks, bookTitle, subject, gradeLevel);

    const groq = getGroqClient();

    if (groq) {
      const formattedMessages = [
        { role: "system" as const, content: systemPrompt },
        ...history.map((h) => ({
          role: (h.role === "model" ? "assistant" : h.role) as "user" | "assistant",
          content: h.content ?? h.parts?.[0]?.text ?? "",
        })),
        { role: "user" as const, content: message },
      ];

      const groqStream = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1024,
        stream: true,
      });

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of groqStream) {
              const text = chunk.choices[0]?.delta?.content || "";
              if (text) {
                const data = `data: ${JSON.stringify({ text })}\n\n`;
                controller.enqueue(encoder.encode(data));
              }
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          } catch (err) {
            console.error("Groq stream error:", err);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Gemini Fallback
    const gemini = getGeminiClient();
    if (gemini) {
      const model = gemini.getGenerativeModel({ model: "gemini-2.5-flash" });
      const chat = model.startChat({
        systemInstruction: systemPrompt,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      });

      const result = await chat.sendMessageStream(message);
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of result.stream) {
              const text = chunk.text();
              if (text) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
              }
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    return new Response("No AI provider key configured", { status: 500 });
  } catch (err: unknown) {
    console.error("Chat error:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return new Response(msg, { status: 500 });
  }
}

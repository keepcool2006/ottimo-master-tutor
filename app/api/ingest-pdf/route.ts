import { NextRequest, NextResponse } from "next/server";
import { chunkPdf } from "@/lib/pdfChunker";
import { embedBatch } from "@/lib/gemini";
import { upsertChunks } from "@/lib/chromaClient";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    let userId = "00000000-0000-0000-0000-000000000000";
    let supabase = null;

    try {
      supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    } catch {
      // Allow unauthenticated demo uploads
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const documentName = formData.get("name") as string | null;

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json({ error: "A PDF file is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const documentId = randomUUID();

    // 1. Parse and chunk the PDF
    const chunks = await chunkPdf(buffer);

    if (chunks.length === 0) {
      return NextResponse.json({ error: "Could not extract text from PDF" }, { status: 422 });
    }

    // 2. Generate embeddings in batches to avoid API rate limits
    const BATCH_SIZE = 20;
    const allEmbeddings: number[][] = [];
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE).map((c) => c.text);
      const embeddings = await embedBatch(batch);
      allEmbeddings.push(...embeddings);
    }

    // 3. Upsert into Chroma
    const ids = chunks.map((_, i) => `${documentId}-chunk-${i}`);
    const texts = chunks.map((c) => c.text);
    const metadatas = chunks.map((c) => ({
      documentId,
      chunkIndex: c.chunkIndex,
      text: c.text,
    }));

    await upsertChunks(ids, allEmbeddings, texts, metadatas);

    // 4. Store document metadata in Supabase (if database table exists)
    if (supabase && userId !== "00000000-0000-0000-0000-000000000000") {
      try {
        await supabase.from("documents").insert({
          id: documentId,
          owner_id: userId,
          name: documentName ?? file.name,
          chroma_collection_id: "ottimo-textbooks",
          chunk_count: chunks.length,
          created_at: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.warn("Supabase record save skipped:", dbErr);
      }
    }

    return NextResponse.json({
      documentId,
      chunkCount: chunks.length,
      name: documentName ?? file.name,
    });
  } catch (err: unknown) {
    console.error("Ingest error:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

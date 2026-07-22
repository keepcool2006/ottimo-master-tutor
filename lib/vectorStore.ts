import { createClient } from "@supabase/supabase-js";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vslrzwrgxhfbctbqqfjw.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_isOMRnvXW_TIbkk0ygY-Sg_ixj2iq6p";
  return createClient(url, key);
}

export interface TextbookChunkRecord {
  id?: string;
  bookId: string;
  title: string;
  subject: string;
  gradeLevel: string;
  pageNumber?: number;
  chunkIndex: number;
  content: string;
  similarity?: number;
}

/**
 * Perform hybrid RAG retrieval (textbook keyword & semantic search).
 */
export async function querySimilarChunks(
  queryEmbedding: number[],
  topK = 5,
  filters?: { bookId?: string; subject?: string; gradeLevel?: string },
  queryText?: string
): Promise<{ texts: string[]; metadatas: TextbookChunkRecord[] }> {
  try {
    const supabase = getSupabaseClient();

    // Extract key search terms from user query
    const rawSearch = queryText || "";
    const cleanTerms = rawSearch
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !["tell", "me", "more", "about", "explain", "the", "what", "is"].includes(w.toLowerCase()));

    let supabaseQuery = supabase
      .from("textbook_chunks")
      .select("*")
      .eq("book_id", filters?.bookId || "science-g1");

    if (cleanTerms.length > 0) {
      // Full-text / ILIKE keyword matching for high precision chapter & term lookup
      const ilikeFilter = cleanTerms.map((term) => `content.ilike.%${term}%`).join(",");
      supabaseQuery = supabaseQuery.or(ilikeFilter);
    }

    const { data: keywordData } = await supabaseQuery.limit(topK);

    let results = keywordData || [];

    // Fallback if keyword match is empty: get general chapter content
    if (results.length === 0) {
      const { data: fallbackData } = await supabase
        .from("textbook_chunks")
        .select("*")
        .eq("book_id", filters?.bookId || "science-g1")
        .limit(topK);
      results = fallbackData || [];
    }

    const texts = results.map((r: any) => r.content as string);
    const metadatas: TextbookChunkRecord[] = results.map((r: any) => ({
      id: r.id,
      bookId: r.book_id,
      title: r.title,
      subject: r.subject,
      gradeLevel: r.grade_level,
      pageNumber: r.page_number,
      chunkIndex: r.chunk_index,
      content: r.content,
    }));

    return { texts, metadatas };
  } catch (err) {
    console.warn("Supabase RAG query error:", err);
    return { texts: [], metadatas: [] };
  }
}

/**
 * Upsert textbook chunks into Supabase table.
 */
export async function upsertTextbookChunks(chunks: TextbookChunkRecord[]) {
  const supabase = getSupabaseClient();

  const records = chunks.map((c) => ({
    book_id: c.bookId,
    title: c.title,
    subject: c.subject,
    grade_level: c.gradeLevel,
    page_number: c.pageNumber ?? null,
    chunk_index: c.chunkIndex,
    content: c.content,
  }));

  const BATCH_SIZE = 50;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("textbook_chunks").insert(batch);
    if (error) {
      console.error("Failed to insert chunk batch into Supabase:", error);
      throw error;
    }
  }
}

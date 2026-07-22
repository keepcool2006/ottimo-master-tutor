import { createClient } from "@supabase/supabase-js";

/**
 * Supabase pgvector client for pre-indexed textbook vector search & ingestion.
 * Uses service role key if available for admin writes, or anon key for queries.
 */
function getSupabaseVectorClient() {
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
  embedding?: number[];
  similarity?: number;
}

/**
 * Query Supabase pgvector for top-k semantically similar textbook chunks with metadata filters.
 */
export async function querySimilarChunks(
  queryEmbedding: number[],
  topK = 5,
  filters?: { bookId?: string; subject?: string; gradeLevel?: string }
): Promise<{ texts: string[]; metadatas: TextbookChunkRecord[] }> {
  try {
    const supabase = getSupabaseVectorClient();

    const { data, error } = await supabase.rpc("match_textbook_chunks", {
      query_embedding: queryEmbedding,
      match_count: topK,
      filter_book_id: filters?.bookId || null,
      filter_subject: filters?.subject || null,
      filter_grade_level: filters?.gradeLevel || null,
    });

    if (error) {
      console.warn("Supabase pgvector RPC warning:", error.message);
      return { texts: [], metadatas: [] };
    }

    if (!data || data.length === 0) {
      return { texts: [], metadatas: [] };
    }

    const texts = data.map((r: any) => r.content as string);
    const metadatas: TextbookChunkRecord[] = data.map((r: any) => ({
      id: r.id,
      bookId: r.book_id,
      title: r.title,
      subject: r.subject,
      gradeLevel: r.grade_level,
      pageNumber: r.page_number,
      chunkIndex: r.chunk_index,
      content: r.content,
      similarity: r.similarity,
    }));

    return { texts, metadatas };
  } catch (err) {
    console.warn("Supabase vector query error:", err);
    return { texts: [], metadatas: [] };
  }
}

/**
 * Upsert textbook chunks into Supabase pgvector table.
 */
export async function upsertTextbookChunks(chunks: TextbookChunkRecord[]) {
  const supabase = getSupabaseVectorClient();

  const records = chunks.map((c) => ({
    book_id: c.bookId,
    title: c.title,
    subject: c.subject,
    grade_level: c.gradeLevel,
    page_number: c.pageNumber ?? null,
    chunk_index: c.chunkIndex,
    content: c.content,
    embedding: c.embedding,
  }));

  // Batch insert
  const BATCH_SIZE = 50;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("textbook_chunks").insert(batch);
    if (error) {
      console.error("Failed to insert chunk batch into Supabase pgvector:", error);
      throw error;
    }
  }
}

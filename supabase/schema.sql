-- ============================================================
-- Ottimo Master Tutor — Supabase Postgres Schema + pgvector
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/vslrzwrgxhfbctbqqfjw/sql/new
-- ============================================================

-- 1. Enable vector extension for semantic RAG search
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Pre-indexed textbook chunks table
CREATE TABLE IF NOT EXISTS textbook_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id text NOT NULL,
  title text NOT NULL,
  subject text NOT NULL,
  grade_level text NOT NULL,
  page_number integer,
  chunk_index integer NOT NULL,
  content text NOT NULL,
  embedding vector(768), -- Dimensions for Gemini text-embedding-004
  created_at timestamptz DEFAULT now()
);

-- Index for ultra-fast HNSW vector cosine similarity search
CREATE INDEX IF NOT EXISTS textbook_chunks_embedding_hnsw_idx
  ON textbook_chunks
  USING hnsw (embedding vector_cosine_ops);

-- RLS policies: Allow public/student read access to textbook chunks
ALTER TABLE textbook_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_chunks" ON textbook_chunks
  FOR SELECT USING (true);

-- 3. Vector Similarity Search Function (RPC)
CREATE OR REPLACE FUNCTION match_textbook_chunks(
  query_embedding vector(768),
  match_count int DEFAULT 5,
  filter_book_id text DEFAULT NULL,
  filter_subject text DEFAULT NULL,
  filter_grade_level text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  book_id text,
  title text,
  subject text,
  grade_level text,
  page_number integer,
  chunk_index integer,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    tc.id,
    tc.book_id,
    tc.title,
    tc.subject,
    tc.grade_level,
    tc.page_number,
    tc.chunk_index,
    tc.content,
    1 - (tc.embedding <=> query_embedding) AS similarity
  FROM textbook_chunks tc
  WHERE
    (filter_book_id IS NULL OR tc.book_id = filter_book_id)
    AND (filter_subject IS NULL OR tc.subject = filter_subject)
    AND (filter_grade_level IS NULL OR tc.grade_level = filter_grade_level)
  ORDER BY tc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

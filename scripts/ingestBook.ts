import fs from "fs";
import { embedBatch } from "../lib/aiClient";
import { upsertTextbookChunks, TextbookChunkRecord } from "../lib/vectorStore";

interface IngestOptions {
  pdfPath: string;
  bookId: string;
  title: string;
  subject: string;
  gradeLevel: string;
}

export async function ingestTextbookToSupabase(opts: IngestOptions) {
  console.log("=".repeat(60));
  console.log(`Starting Supabase pgvector Admin Ingestion for: ${opts.title}`);
  console.log(`Book ID: ${opts.bookId} | Subject: ${opts.subject} | Grade: ${opts.gradeLevel}`);
  console.log("=".repeat(60));

  const ocrJsonPath = "/tmp/extracted_science_pdf.json";
  let pageTexts: Array<{ page: number; text: string }> = [];

  if (fs.existsSync(ocrJsonPath)) {
    console.log("✅ Reading pre-extracted OCR text from", ocrJsonPath);
    pageTexts = JSON.parse(fs.readFileSync(ocrJsonPath, "utf-8"));
  } else {
    throw new Error(`OCR text file not found at ${ocrJsonPath}`);
  }

  // Create overlapping chunks (1000 size, 200 overlap)
  const chunks: Array<{ text: string; pageNumber: number; chunkIndex: number }> = [];
  let chunkCounter = 0;

  for (const item of pageTexts) {
    const text = item.text.trim();
    if (!text) continue;

    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + 1000, text.length);
      const chunkText = text.slice(start, end).trim();
      if (chunkText.length > 30) {
        chunks.push({
          text: chunkText,
          pageNumber: item.page,
          chunkIndex: chunkCounter++,
        });
      }
      start += 800;
    }
  }

  console.log(`✅ Generated ${chunks.length} chunks from ${pageTexts.length} pages.`);

  // Generate embeddings
  const BATCH_SIZE = 25;
  const allEmbeddings: number[][] = [];
  console.log("Generating embeddings with Gemini text-embedding-004...");

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batchTexts = chunks.slice(i, i + BATCH_SIZE).map((c) => c.text);
    const vecs = await embedBatch(batchTexts);
    allEmbeddings.push(...vecs);
    console.log(`  Processed ${Math.min(i + BATCH_SIZE, chunks.length)} / ${chunks.length} vector embeddings...`);
  }

  // Build records
  const records: TextbookChunkRecord[] = chunks.map((c, i) => ({
    bookId: opts.bookId,
    title: opts.title,
    subject: opts.subject,
    gradeLevel: opts.gradeLevel,
    pageNumber: c.pageNumber,
    chunkIndex: c.chunkIndex,
    content: c.text,
    embedding: allEmbeddings[i],
  }));

  console.log("Pushing vector records to Supabase pgvector table (textbook_chunks)...");
  await upsertTextbookChunks(records);
  console.log(`🎉 Ingestion Complete! Successfully stored ${records.length} vector records in Supabase pgvector.`);
}

if (require.main === module) {
  ingestTextbookToSupabase({
    pdfPath: "/Users/mayankverma/.gemini/antigravity/scratch/ai_tutor/data/Infinity Science - 1.pdf",
    bookId: "science-g1",
    title: "Infinity Science - Book 1",
    subject: "Science",
    gradeLevel: "Grade 1",
  }).catch((err) => {
    console.error("Supabase ingestion failed:", err);
    process.exit(1);
  });
}

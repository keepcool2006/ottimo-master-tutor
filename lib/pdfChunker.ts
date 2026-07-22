/**
 * Lean PDF chunker — extracts text from a PDF buffer and splits into
 * overlapping chunks suitable for semantic embedding.
 *
 * No LangChain dependency: pdf-parse for extraction, manual sliding
 * window for chunking. ~60 lines vs hundreds of transitive deps.
 *
 * pdf-parse is CJS-only, so we dynamic-import it inside the function
 * to stay compatible with Next.js ESM target.
 */

export interface TextChunk {
  text: string;
  chunkIndex: number;
  pageNumber?: number;
}

async function extractText(buffer: Buffer): Promise<{ text: string }> {
  const pdfModule = await import("pdf-parse");
  // pdf-parse v2 exposes the function as a named export matching the module shape
  type PdfParseFn = (buf: Buffer) => Promise<{ text: string }>;
  const pdfParse = ((pdfModule as unknown as { default: PdfParseFn }).default ??
    pdfModule) as unknown as PdfParseFn;
  return pdfParse(buffer);
}

/**
 * Split text into overlapping chunks.
 * @param text - Full document text
 * @param chunkSize - Approximate chars per chunk (~750 chars ≈ ~150 tokens)
 * @param overlap - Overlap chars between consecutive chunks
 */
function splitIntoChunks(
  text: string,
  chunkSize = 1000,
  overlap = 200
): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 50) {
      // skip near-empty chunks (whitespace-only pages)
      chunks.push(chunk);
    }
    start += chunkSize - overlap;
  }

  return chunks;
}

/** Full pipeline: PDF buffer → array of TextChunks ready for embedding */
export async function chunkPdf(buffer: Buffer): Promise<TextChunk[]> {
  const { text } = await extractText(buffer);

  // Normalise whitespace: collapse multiple newlines/spaces
  const cleaned = text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/ {2,}/g, " ")
    .trim();

  const rawChunks = splitIntoChunks(cleaned, 1000, 200);

  return rawChunks.map((chunkText, chunkIndex) => ({
    text: chunkText,
    chunkIndex,
  }));
}

import { ChromaClient, CloudClient, Collection } from "chromadb";

let _client: ChromaClient | CloudClient | null = null;
let _collection: Collection | null = null;

function getClient(): ChromaClient | CloudClient {
  if (!_client) {
    const apiKey = process.env.CHROMA_API_KEY;
    const chromaUrl = process.env.CHROMA_URL ?? "http://localhost:8000";

    if (apiKey) {
      const tenant = process.env.CHROMA_TENANT;
      const database = process.env.CHROMA_DATABASE;
      _client = new CloudClient({
        apiKey,
        ...(tenant ? { tenant } : {}),
        ...(database ? { database } : {}),
      });
    } else {
      const url = new URL(chromaUrl);
      _client = new ChromaClient({
        host: url.hostname,
        port: Number(url.port) || (url.protocol === "https:" ? 443 : 80),
        ssl: url.protocol === "https:",
      });
    }
  }
  return _client;
}

const dummyEmbeddingFunction = {
  generate: async (texts: string[]) => texts.map(() => []),
};

/** Get or create the default textbook collection */
export async function getCollection(): Promise<Collection | null> {
  if (_collection) return _collection;
  try {
    const collectionName = process.env.CHROMA_COLLECTION_NAME ?? "ottimo-textbooks";
    const client = getClient();
    _collection = await client.getOrCreateCollection({
      name: collectionName,
      embeddingFunction: dummyEmbeddingFunction,
      metadata: { "hnsw:space": "cosine" },
    });
    return _collection;
  } catch (err) {
    console.warn("Chroma database connection unavailable:", err);
    return null;
  }
}

export interface ChunkMetadata {
  documentId: string;
  chunkIndex: number;
  pageNumber?: number;
  text: string;
  bookId?: string;
  subject?: string;
  gradeLevel?: string;
  title?: string;
}

/** Upsert chunks with their embeddings into Chroma */
export async function upsertChunks(
  ids: string[],
  embeddings: number[][],
  documents: string[],
  metadatas: ChunkMetadata[]
) {
  const col = await getCollection();
  if (!col) {
    console.warn("Chroma offline — skipping vector upsert.");
    return;
  }
  await col.upsert({
    ids,
    embeddings,
    documents,
    metadatas: metadatas as unknown as Record<string, string | number | boolean>[],
  });
}

/** Query top-k similar chunks for a given query embedding */
export async function querySimilar(
  queryEmbedding: number[],
  topK = 5,
  whereFilter?: Record<string, string>
): Promise<{ texts: string[]; metadatas: ChunkMetadata[] }> {
  try {
    const col = await getCollection();
    if (!col) {
      return { texts: [], metadatas: [] };
    }
    const result = await col.query({
      queryEmbeddings: [queryEmbedding],
      nResults: topK,
      ...(whereFilter ? { where: whereFilter } : {}),
    });

    return {
      texts: (result.documents[0] ?? []) as string[],
      metadatas: (result.metadatas[0] ?? []) as unknown as ChunkMetadata[],
    };
  } catch (err) {
    console.warn("Chroma query warning:", err);
    return { texts: [], metadatas: [] };
  }
}

/** Delete all chunks belonging to a document */
export async function deleteDocumentChunks(documentId: string) {
  try {
    const col = await getCollection();
    if (col) {
      await col.delete({ where: { documentId } });
    }
  } catch (err) {
    console.warn("Chroma delete warning:", err);
  }
}

/**
 * Single source of truth for environment variables.
 * Public vars (NEXT_PUBLIC_*) are available in browser and server.
 * Private vars are server-only — accessed lazily to avoid build-time failures.
 * Never call process.env directly in app code — import from here.
 */

function getRequired(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getOptional(key: string, fallback = ""): string {
  return process.env[key] ?? fallback;
}

// Public vars — safe to read at module level in browser and server
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Server-only vars — accessed lazily via getters so they don't blow up client bundles
export function getGeminiApiKey(): string {
  return getRequired("GEMINI_API_KEY");
}

export function getChromaUrl(): string {
  return getOptional("CHROMA_URL", "http://localhost:8000");
}

export function getChromaApiKey(): string {
  return getOptional("CHROMA_API_KEY");
}

export function getChromaCollectionName(): string {
  return getOptional("CHROMA_COLLECTION_NAME", "ottimo-textbooks");
}

// Convenience object for server-side code
export const env = {
  supabaseUrl,
  supabaseAnonKey,
  appUrl,
  get geminiApiKey() { return getGeminiApiKey(); },
  get chromaUrl() { return getChromaUrl(); },
  get chromaApiKey() { return getChromaApiKey(); },
  get chromaCollectionName() { return getChromaCollectionName(); },
} as const;

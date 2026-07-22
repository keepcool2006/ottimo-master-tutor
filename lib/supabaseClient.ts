import { createBrowserClient } from "@supabase/ssr";
import { env } from "./env";

/**
 * Browser-side Supabase client.
 * Use in Client Components ('use client').
 */
export function createClient() {
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}

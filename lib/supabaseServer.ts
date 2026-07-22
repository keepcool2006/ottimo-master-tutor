import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "./env";

/**
 * Server-side Supabase client with cookie-based session.
 * Use ONLY in Server Components, API routes, and server actions.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { env, isSupabaseConfigured } from "@/lib/env";
import type { Database } from "@/types/database";

export async function createClient() {
  if (!isSupabaseConfigured()) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server components can read cookies but cannot always write refreshed ones.
        }
      }
    }
  });
}

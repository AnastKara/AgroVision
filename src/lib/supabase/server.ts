import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Official AgroVision Supabase project credentials.
// They can be overridden via environment variables, but these are the
// defaults so Google OAuth works out of the box.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://nbmcnvqgwemzltfdgpbb.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ibWNudnFnd2Vtemx0ZmRncGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMTk3MjEsImV4cCI6MjEwMDc5NTcyMX0.u9CRuQUBLppGwjcFxDTmf8xd6G0nKFVcc9clSdX_XRg";

export async function createClient() {
  const cookieStore = await cookies();

return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}


import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  // Return null if Supabase is not configured
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === "your_supabase_project_url_here") {
    return null as any;
  }
  if (!client) {
    client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
}


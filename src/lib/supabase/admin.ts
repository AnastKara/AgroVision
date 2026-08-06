import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let adminClient: ReturnType<typeof createSupabaseClient> | null = null;

/**
 * Create a Supabase admin client using the service role key.
 *
 * This client bypasses RLS and is intended ONLY for trusted server-side
 * operations (e.g. Stripe webhook handlers). NEVER expose it to the client.
 *
 * Returns null if Supabase or the service role key is not configured.
 */
export function createAdminClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }

  if (!adminClient) {
    adminClient = createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}

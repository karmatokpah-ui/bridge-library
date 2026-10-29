import { createClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";
import { BRIDGE_PUBLISHABLE_KEY, BRIDGE_SUPABASE_URL } from "../supabase";

// Always the original BridgeLIB backend, acting as the verified caller so RLS applies.
export function supabaseForUser(ctx: ToolContext) {
  const token = ctx.getToken();
  if (!token) throw new Error("supabaseForUser requires a verified OAuth token");
  return createClient(BRIDGE_SUPABASE_URL, BRIDGE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

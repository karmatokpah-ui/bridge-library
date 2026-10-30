import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireBridgeAuth } from "./bridge-auth";
const missing =
  "Account-saved study conversations are unavailable until the original website data connection is restored.";
export const studyThreads = createServerFn({ method: "POST" })
  .middleware([requireBridgeAuth])
  .handler(async ({ context }) => {
    const r = await context.supabase
      .from("bridge_study_threads")
      .select("id,title,created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (r.error) throw new Error(missing);
    return (r.data ?? []) as Array<{ id: string; title: string; created_at: string }>;
  });
export const createStudyThread = createServerFn({ method: "POST" })
  .middleware([requireBridgeAuth])
  .inputValidator((v: unknown) => z.string().trim().min(1).max(100).parse(v))
  .handler(async ({ data, context }) => {
    const r = await context.supabase
      .from("bridge_study_threads")
      .insert({ user_id: context.userId, title: data })
      .select("id")
      .single();
    if (r.error || !r.data) throw new Error(missing);
    return { id: String(r.data.id) };
  });
export const studyHistory = createServerFn({ method: "POST" })
  .middleware([requireBridgeAuth])
  .inputValidator((v: unknown) => z.string().uuid().parse(v))
  .handler(async ({ data, context }) => {
    const owner = await context.supabase
      .from("bridge_study_threads")
      .select("id")
      .eq("id", data)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (owner.error) throw new Error(missing);
    if (!owner.data) throw new Error("Conversation unavailable.");
    const r = await context.supabase
      .from("bridge_study_messages")
      .select("message")
      .eq("thread_id", data)
      .eq("user_id", context.userId)
      .order("created_at");
    if (r.error) throw new Error(missing);
    return JSON.stringify((r.data ?? []).map((row) => row.message));
  });

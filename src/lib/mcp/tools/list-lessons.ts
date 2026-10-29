import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_lessons",
  title: "List lessons",
  description: "List published lessons for one subject, including whether the user has completed each.",
  inputSchema: { subject_id: z.number().int().positive().describe("Subject ID from list_subjects.") },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ subject_id }, ctx) => {
    const sb = supabaseForUser(ctx);
    const [lessons, done] = await Promise.all([
      sb.from("lessons").select("id,title,content").eq("subject_id", subject_id).eq("is_published", true).order("created_at").limit(200),
      sb.from("lesson_completions").select("lesson_id").eq("user_id", ctx.getUserId() ?? ""),
    ]);
    if (lessons.error) throw new ToolError(lessons.error.message);
    const completed = new Set((done.data ?? []).map((r) => String(r.lesson_id)));
    const rows = (lessons.data ?? []).map((l) => ({ id: String(l.id), title: String(l.title ?? ""), content: l.content == null ? null : String(l.content), completed: completed.has(String(l.id)) }));
    return { content: [{ type: "text", text: JSON.stringify(rows) }], structuredContent: { lessons: rows } };
  },
});

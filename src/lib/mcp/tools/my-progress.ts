import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "my_progress",
  title: "My learning progress",
  description: "Show the signed-in user's enrolled courses, completed lesson count and recent exam attempts.",
  inputSchema: {},
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async (_args, ctx) => {
    const uid = ctx.getUserId() ?? "";
    const sb = supabaseForUser(ctx);
    const [enr, comp, att] = await Promise.all([
      sb.from("course_enrollments").select("subject_id").eq("user_id", uid),
      sb.from("lesson_completions").select("lesson_id").eq("user_id", uid),
      sb.from("exam_attempts").select("*").eq("user_id", uid).order("submitted_at", { ascending: false }).limit(10),
    ]);
    const err = enr.error ?? comp.error ?? att.error;
    if (err) throw new ToolError(err.message);
    const result = {
      enrolled_subject_ids: (enr.data ?? []).map((r) => Number(r.subject_id)),
      completed_lessons: (comp.data ?? []).length,
      recent_attempts: (att.data ?? []).map((a) => ({ id: String(a.id), score: a.score == null ? null : Number(a.score), total: a.total_questions == null ? null : Number(a.total_questions), submitted_at: a.submitted_at == null ? null : String(a.submitted_at) })),
    };
    return { content: [{ type: "text", text: JSON.stringify(result) }], structuredContent: result };
  },
});

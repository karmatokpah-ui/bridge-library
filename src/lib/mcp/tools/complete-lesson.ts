import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "complete_lesson",
  title: "Mark lesson complete",
  description: "Mark a published lesson as completed for the signed-in user.",
  inputSchema: { lesson_id: z.string().uuid().describe("Lesson ID from list_lessons.") },
  annotations: { readOnlyHint: false, idempotentHint: true, destructiveHint: false, openWorldHint: false },
  handler: async ({ lesson_id }, ctx) => {
    const { error } = await supabaseForUser(ctx).from("lesson_completions").upsert({ user_id: ctx.getUserId(), lesson_id }, { onConflict: "user_id,lesson_id", ignoreDuplicates: true });
    if (error) throw new ToolError(error.message);
    return { content: [{ type: "text", text: "Lesson marked complete." }] };
  },
});

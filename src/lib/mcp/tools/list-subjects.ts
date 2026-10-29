import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_subjects",
  title: "List subjects",
  description: "List BridgeLIB course subjects the signed-in user can see.",
  inputSchema: {},
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async (_args, ctx) => {
    const { data, error } = await supabaseForUser(ctx).from("subjects").select("id,name,description").order("name").limit(200);
    if (error) throw new ToolError(error.message);
    const subjects = (data ?? []).map((s) => ({ id: Number(s.id), name: String(s.name ?? ""), description: s.description == null ? null : String(s.description) }));
    return { content: [{ type: "text", text: JSON.stringify(subjects) }], structuredContent: { subjects } };
  },
});

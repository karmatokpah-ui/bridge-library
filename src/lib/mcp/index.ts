import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listSubjects from "./tools/list-subjects";
import listLessons from "./tools/list-lessons";
import myProgress from "./tools/my-progress";
import completeLesson from "./tools/complete-lesson";

export default defineMcp({
  name: "bridgelib",
  title: "BridgeLIB",
  version: "0.1.0",
  instructions: "Tools for BridgeLIB learners: browse subjects and lessons, check your progress, and mark lessons complete. All actions run as the signed-in user.",
  // Tokens come from the original BridgeLIB account service, not the editor-bound Cloud project.
  auth: auth.oauth.issuer({
    issuer: "https://qlwtccmvddhgdnknrgnh.supabase.co/auth/v1",
    acceptedAudiences: "authenticated",
  }),
  tools: [listSubjects, listLessons, myProgress, completeLesson],
});

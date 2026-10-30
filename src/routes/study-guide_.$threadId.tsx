import { createFileRoute } from "@tanstack/react-router";
import { StudyGuide } from "@/components/learning/StudyGuide";
export const Route = createFileRoute("/study-guide_/$threadId")({
  head: () => ({
    meta: [
      { title: "Study conversation — BridgeLIB" },
      {
        name: "description",
        content:
          "Continue your private BridgeLIB study conversation and plan your next learning steps.",
      },
      { property: "og:title", content: "Study conversation — BridgeLIB" },
      {
        property: "og:description",
        content: "Private study guidance grounded in your own course progress.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConversationPage,
});
function ConversationPage() {
  const { threadId } = Route.useParams();
  return <StudyGuide threadId={threadId} />;
}

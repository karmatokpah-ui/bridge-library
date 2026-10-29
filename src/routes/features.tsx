import { createFileRoute } from "@tanstack/react-router";
import { FeaturesPage } from "@/components/site/InfoPages";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — BridgeLIB" },
      { name: "description", content: "Courses, past questions, mock tests, video lessons and progress tracking on BridgeLIB." },
      { property: "og:title", content: "Features — BridgeLIB" },
      { property: "og:description", content: "Courses, past questions, mock tests, video lessons and progress tracking on BridgeLIB." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FeaturesPage,
});

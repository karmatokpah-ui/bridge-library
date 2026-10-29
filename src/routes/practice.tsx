import { createFileRoute } from "@tanstack/react-router";

import { PracticePage } from "@/components/BridgeApp";

export const Route = createFileRoute("/practice")({
  validateSearch: (search: Record<string, unknown>): { subject?: string } => typeof search['subject'] === 'string' ? { subject: search['subject'] } : {},
  head: () => ({
    meta: [
      { title: "BridgeLIB — Practice exams" },
      {
        name: "description",
        content:
          "Practise your subjects, answer exam questions, track your score, and learn from explanations.",
      },
      { property: "og:title", content: "BridgeLIB — Practice exams" },
      {
        property: "og:description",
        content:
          "Practise your subjects, answer exam questions, track your score, and learn from explanations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PracticePage,
});

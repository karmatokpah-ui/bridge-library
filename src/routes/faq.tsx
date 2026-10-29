import { createFileRoute } from "@tanstack/react-router";
import { FaqPage } from "@/components/site/InfoPages";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQs — BridgeLIB" },
      { name: "description", content: "Answers to common questions about BridgeLIB accounts, practice and progress." },
      { property: "og:title", content: "FAQs — BridgeLIB" },
      { property: "og:description", content: "Answers to common questions about BridgeLIB accounts, practice and progress." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FaqPage,
});

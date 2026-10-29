import { createFileRoute } from "@tanstack/react-router";
import { TermsPage } from "@/components/site/InfoPages";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — BridgeLIB" },
      { name: "description", content: "The rules for using the BridgeLIB learning platform." },
      { property: "og:title", content: "Terms of Service — BridgeLIB" },
      { property: "og:description", content: "The rules for using the BridgeLIB learning platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

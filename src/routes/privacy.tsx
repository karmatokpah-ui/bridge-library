import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "@/components/site/InfoPages";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — BridgeLIB" },
      { name: "description", content: "How BridgeLIB collects, uses and protects your information." },
      { property: "og:title", content: "Privacy Policy — BridgeLIB" },
      { property: "og:description", content: "How BridgeLIB collects, uses and protects your information." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

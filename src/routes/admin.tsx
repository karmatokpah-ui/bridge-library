import { createFileRoute } from "@tanstack/react-router";

import { BridgeHome } from "@/components/BridgeApp";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "BridgeLIB — Admin dashboard" },
      {
        name: "description",
        content:
          "BridgeLIB administrator dashboard for managing subjects, lessons, and exam questions.",
      },
      { property: "og:title", content: "BridgeLIB — Admin dashboard" },
      {
        property: "og:description",
        content:
          "BridgeLIB administrator dashboard for managing subjects, lessons, and exam questions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BridgeHome,
});

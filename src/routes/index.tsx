import { createFileRoute } from "@tanstack/react-router";

import { BridgeHome } from "@/components/BridgeApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BridgeLIB — Learn better. Move forward." },
      {
        name: "description",
        content:
          "Lessons, practice, school classes, and exam preparation—brought together in one learning platform for Liberia.",
      },
      { property: "og:title", content: "BridgeLIB — Learn better. Move forward." },
      {
        property: "og:description",
        content:
          "Lessons, practice, school classes, and exam preparation—brought together in one learning platform for Liberia.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BridgeHome,
});

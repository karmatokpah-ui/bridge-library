import { createFileRoute } from "@tanstack/react-router";
import { SiteContentEditor } from "@/components/admin/SiteContentEditor";

export const Route = createFileRoute("/site-content")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Website content — BridgeLIB admin" },
      { name: "description", content: "Administrators edit BridgeLIB's video, contact details, FAQs and policies." },
      { property: "og:title", content: "Website content — BridgeLIB admin" },
      { property: "og:description", content: "Edit public website content for BridgeLIB." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SiteContentEditor,
});

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// Admin-editable website content, stored as `site.*` rows in feature_settings
// (value lives in `label`). Publicly readable, admin-only writable via RLS.
export const SITE_PREFIX = "site.";

export const siteFields = [
  { key: "video_url", label: "Watch Video link (YouTube, Vimeo or .mp4)", type: "url" },
  { key: "contact_address", label: "Address", type: "text" },
  { key: "contact_phone", label: "Phone number", type: "text" },
  { key: "contact_email", label: "Email address", type: "email" },
  { key: "facebook", label: "Facebook link", type: "url" },
  { key: "x", label: "X (Twitter) link", type: "url" },
  { key: "youtube", label: "YouTube channel link", type: "url" },
  { key: "instagram", label: "Instagram link", type: "url" },
  { key: "linkedin", label: "LinkedIn link", type: "url" },
  { key: "faq", label: "FAQs", type: "long" },
  { key: "terms", label: "Terms of Service", type: "long" },
  { key: "privacy", label: "Privacy Policy", type: "long" },
] as const;

export type SiteKey = (typeof siteFields)[number]["key"];
export type SiteContent = Partial<Record<SiteKey, string>>;

export function rowsToContent(rows: Array<{ key: string; label: string }>): SiteContent {
  const out: SiteContent = {};
  for (const r of rows) {
    if (!r.key.startsWith(SITE_PREFIX)) continue;
    const k = r.key.slice(SITE_PREFIX.length) as SiteKey;
    const v = r.label.trim();
    if (v) out[k] = v;
  }
  return out;
}

/** Blocks separated by blank lines; first line is the heading/question, rest is the text. */
export function parseBlocks(text: string | undefined): Array<[string, string]> {
  if (!text) return [];
  return text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => {
      const [head = "", ...rest] = b.split("\n");
      return [head.trim(), rest.join("\n").trim()] as [string, string];
    });
}

export function safeUrl(v: string | undefined): string | undefined {
  if (!v) return undefined;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : undefined;
  } catch {
    return undefined;
  }
}

export const siteContentQueryKey = ["site-content"] as const;

export function useSiteContent() {
  return useQuery({
    queryKey: siteContentQueryKey,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feature_settings")
        .select("key,label")
        .like("key", `${SITE_PREFIX}%`);
      if (error) throw error;
      return rowsToContent((data ?? []) as Array<{ key: string; label: string }>);
    },
  });
}

export async function saveSiteContent(values: SiteContent) {
  const rows = siteFields.map((f) => ({
    key: SITE_PREFIX + f.key,
    label: (values[f.key] ?? "").trim(),
    enabled: true,
  }));
  const { error } = await supabase.from("feature_settings").upsert(rows, { onConflict: "key" });
  if (error) throw new Error(error.message);
}

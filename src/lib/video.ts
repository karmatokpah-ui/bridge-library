export type VideoSource = { kind: "embed"; src: string } | { kind: "file"; src: string };

/**
 * Resolve a configurable video URL into something the player can render.
 * Returns null when the value is empty or not a usable URL.
 */
export function resolveVideoSource(raw: string | null | undefined): VideoSource | null {
  const value = (raw ?? "").trim();
  if (!value) return null;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  const embed = (src: string): VideoSource => ({ kind: "embed", src });

  // YouTube: watch pages, share links, shorts, existing embeds and live pages.
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") {
      const id = url.searchParams.get("v");
      return id ? embed(`https://www.youtube-nocookie.com/embed/${id}`) : null;
    }
    const match = url.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{6,})/);
    return match ? embed(`https://www.youtube-nocookie.com/embed/${match[1]}`) : null;
  }
  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return id ? embed(`https://www.youtube-nocookie.com/embed/${id}`) : null;
  }

  // Vimeo links and player pages.
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const match = url.pathname.match(/\/(?:video\/)?(\d{6,})/);
    return match ? embed(`https://player.vimeo.com/video/${match[1]}`) : null;
  }

  // Anything else (including direct .mp4/.webm files): try native playback.
  return { kind: "file", src: value };
}

/** Add autoplay to an embed URL without breaking existing query strings. */
export function withAutoplay(src: string): string {
  return src.includes("?") ? `${src}&autoplay=1` : `${src}?autoplay=1`;
}

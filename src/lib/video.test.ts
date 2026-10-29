import { describe, expect, it } from "vitest";
import { resolveVideoSource, withAutoplay } from "./video";

describe("resolveVideoSource", () => {
  it("returns null for empty, malformed or non-http values", () => {
    expect(resolveVideoSource(null)).toBeNull();
    expect(resolveVideoSource("   ")).toBeNull();
    expect(resolveVideoSource("not a url")).toBeNull();
    expect(resolveVideoSource("javascript:alert(1)")).toBeNull();
  });

  it("converts YouTube watch, share and shorts links to nocookie embeds", () => {
    expect(resolveVideoSource("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toEqual({
      kind: "embed",
      src: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    });
    expect(resolveVideoSource("https://youtu.be/dQw4w9WgXcQ")).toEqual({
      kind: "embed",
      src: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    });
    expect(resolveVideoSource("https://m.youtube.com/shorts/abcdefghijk")).toEqual({
      kind: "embed",
      src: "https://www.youtube-nocookie.com/embed/abcdefghijk",
    });
  });

  it("converts Vimeo links to player embeds", () => {
    expect(resolveVideoSource("https://vimeo.com/123456789")).toEqual({
      kind: "embed",
      src: "https://player.vimeo.com/video/123456789",
    });
  });

  it("plays direct video files as native video", () => {
    expect(resolveVideoSource("https://example.com/intro.mp4")).toEqual({
      kind: "file",
      src: "https://example.com/intro.mp4",
    });
  });

  it("rejects YouTube watch links without an id", () => {
    expect(resolveVideoSource("https://www.youtube.com/watch")).toBeNull();
  });
});

describe("withAutoplay", () => {
  it("appends autoplay with the right separator", () => {
    expect(withAutoplay("https://a.dev/embed/1")).toBe("https://a.dev/embed/1?autoplay=1");
    expect(withAutoplay("https://a.dev/embed/1?rel=0")).toBe("https://a.dev/embed/1?rel=0&autoplay=1");
  });
});

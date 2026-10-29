import { describe, expect, it } from "vitest";
import { emptyFilter, matchesFilter } from "./admin-filters";

const lesson = { subject_id: 2, is_published: false };

describe("admin filters", () => {
  it("search is case-insensitive across fields", () => {
    expect(matchesFilter({ ...emptyFilter, query: "ALGE" }, lesson, "", "Algebra basics")).toBe(
      true,
    );
    expect(matchesFilter({ ...emptyFilter, query: "cells" }, lesson, "", "Algebra")).toBe(false);
  });
  it("filters by subject", () => {
    expect(matchesFilter({ ...emptyFilter, subjectId: "2" }, lesson, "")).toBe(true);
    expect(matchesFilter({ ...emptyFilter, subjectId: "3" }, lesson, "")).toBe(false);
  });
  it("filters drafts vs published", () => {
    expect(matchesFilter({ ...emptyFilter, status: "draft" }, lesson, "")).toBe(true);
    expect(matchesFilter({ ...emptyFilter, status: "published" }, lesson, "")).toBe(false);
  });
  it("filters by level or exam type", () => {
    expect(matchesFilter({ ...emptyFilter, extra: "WASSCE" }, lesson, "WASSCE")).toBe(true);
    expect(matchesFilter({ ...emptyFilter, extra: "WASSCE" }, lesson, "BECE")).toBe(false);
  });
});

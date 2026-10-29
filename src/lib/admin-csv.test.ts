import { describe, expect, it } from "vitest";
import { duplicateKey, parseCsv, prepareImport, toCsv } from "./admin-csv";

const subjects = [{ id: 1, name: "Mathematics" }];

describe("admin CSV", () => {
  it("round-trips commas, quotes and new lines", () => {
    const csv = toCsv(["a", "b"], [{ a: 'x, "y"', b: "line1\nline2" }]);
    expect(parseCsv(csv)).toEqual([
      ["a", "b"],
      ['x, "y"', "line1\nline2"],
    ]);
  });

  it("neutralises spreadsheet formulas on export", () => {
    expect(toCsv(["a"], [{ a: "=SUM(A1)" }])).toContain("'=SUM(A1)");
  });

  it("rejects a file missing required columns", () => {
    const r = prepareImport("lessons", [["title"]], subjects, new Set());
    expect(r.valid).toHaveLength(0);
    expect(r.issues[0]?.message).toMatch(/subject/);
  });

  it("skips duplicates already in the database and within the file", () => {
    const rows = parseCsv("name\nMathematics\nPhysics\nphysics\n");
    const r = prepareImport("subjects", rows, subjects, new Set([duplicateKey("Mathematics")]));
    expect(r.valid.map((v) => v.value.name)).toEqual(["Physics"]);
    expect(r.issues).toHaveLength(2);
  });

  it("validates question options and the correct answer", () => {
    const rows = parseCsv(
      "subject,prompt,option_a,option_b,option_c,option_d,correct_option\n" +
        "Mathematics,2+2?,3,4,5,6,B\n" +
        "Mathematics,1+1?,1,2,3,4,E\n" +
        "Unknown,x?,1,2,3,4,A\n",
    );
    const r = prepareImport("questions", rows, subjects, new Set());
    expect(r.valid).toHaveLength(1);
    expect(r.valid[0]?.value.correct_option).toBe("B");
    expect(r.valid[0]?.value.is_published).toBe(false);
    expect(r.issues.map((i) => i.line)).toEqual([3, 4]);
  });
});

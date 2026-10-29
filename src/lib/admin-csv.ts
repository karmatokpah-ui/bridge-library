// CSV import/export helpers for the admin dashboard. Pure functions — no database access.

export type Kind = "subjects" | "lessons" | "questions";

export const COLUMNS: Record<Kind, string[]> = {
  subjects: ["name", "description"],
  lessons: [
    "subject",
    "title",
    "summary",
    "content",
    "education_level",
    "grade_level",
    "is_published",
  ],
  questions: [
    "subject",
    "prompt",
    "option_a",
    "option_b",
    "option_c",
    "option_d",
    "correct_option",
    "explanation",
    "exam_type",
    "is_published",
  ],
};

export const MAX_IMPORT_BYTES = 1024 * 1024; // 1 MB
export const MAX_IMPORT_ROWS = 1000;

function cell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  // Neutralise spreadsheet formula injection.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function toCsv(headers: string[], rows: Array<Record<string, unknown>>): string {
  const lines = [headers.join(",")];
  for (const r of rows) lines.push(headers.map((h) => cell(r[h])).join(","));
  return "\uFEFF" + lines.join("\r\n") + "\r\n";
}

export function parseCsv(text: string): string[][] {
  const src = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
    } else if (c === '"' && field === "") quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (quoted) throw new Error("The file has an unclosed quote.");
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

function bool(v: string | undefined): boolean | null {
  const s = (v ?? "").trim().toLowerCase();
  if (["", "false", "no", "0", "draft"].includes(s)) return false;
  if (["true", "yes", "1", "published"].includes(s)) return true;
  return null;
}

export type SubjectRef = { id: number; name: string };
export type RowIssue = { line: number; message: string };
export type Prepared<T> = { valid: Array<{ line: number; value: T }>; issues: RowIssue[] };

export type SubjectInput = { name: string; description: string | null };
export type LessonInput = {
  subject_id: number;
  title: string;
  summary: string | null;
  content: string;
  education_level: string;
  grade_level: string | null;
  is_published: boolean;
};
export type QuestionInput = {
  subject_id: number;
  prompt: string;
  options: Array<{ id: string; text: string }>;
  correct_option: string;
  explanation: string | null;
  exam_type: string;
  is_published: boolean;
};

const key = (...parts: Array<string | number>) => parts.join("|").trim().toLowerCase();

/** Validate parsed CSV rows. `existing` holds duplicate keys already in the database. */
export function prepareImport(
  kind: "subjects",
  rows: string[][],
  subjects: SubjectRef[],
  existing: Set<string>,
): Prepared<SubjectInput>;
export function prepareImport(
  kind: "lessons",
  rows: string[][],
  subjects: SubjectRef[],
  existing: Set<string>,
): Prepared<LessonInput>;
export function prepareImport(
  kind: "questions",
  rows: string[][],
  subjects: SubjectRef[],
  existing: Set<string>,
): Prepared<QuestionInput>;
export function prepareImport(
  kind: Kind,
  rows: string[][],
  subjects: SubjectRef[],
  existing: Set<string>,
): Prepared<unknown> {
  const out: Prepared<unknown> = { valid: [], issues: [] };
  const [header, ...body] = rows;
  if (!header) {
    out.issues.push({ line: 1, message: "The file is empty." });
    return out;
  }
  const cols = header.map((h) => h.trim().toLowerCase());
  const required =
    kind === "subjects" ? ["name"] : COLUMNS[kind].slice(0, kind === "lessons" ? 4 : 7);
  const missing = required.filter((c) => !cols.includes(c));
  if (missing.length) {
    out.issues.push({ line: 1, message: `Missing column(s): ${missing.join(", ")}` });
    return out;
  }
  if (body.length > MAX_IMPORT_ROWS) {
    out.issues.push({ line: 1, message: `Too many rows (max ${MAX_IMPORT_ROWS}).` });
    return out;
  }
  const subjectByName = new Map(subjects.map((s) => [s.name.trim().toLowerCase(), s.id]));
  const seen = new Set(existing);

  body.forEach((r, i) => {
    const line = i + 2;
    const get = (c: string) => (r[cols.indexOf(c)] ?? "").trim();
    const fail = (message: string): void => {
      out.issues.push({ line, message });
    };

    if (kind === "subjects") {
      const name = get("name");
      if (name.length < 2 || name.length > 100) return fail("Name must be 2–100 characters.");
      const k = key(name);
      if (seen.has(k)) return fail(`Duplicate subject "${name}" — skipped.`);
      seen.add(k);
      out.valid.push({ line, value: { name, description: get("description") || null } });
      return;
    }

    const subjectName = get("subject");
    const subject_id = subjectByName.get(subjectName.toLowerCase());
    if (!subject_id) return fail(`Unknown subject "${subjectName}".`);
    const published = bool(get("is_published"));
    if (published === null) return fail("is_published must be true or false.");

    if (kind === "lessons") {
      const title = get("title");
      const content = get("content");
      if (!title) return fail("Title is required.");
      if (!content) return fail("Content is required.");
      const k = key(subject_id, title);
      if (seen.has(k)) return fail(`Duplicate lesson "${title}" — skipped.`);
      seen.add(k);
      out.valid.push({
        line,
        value: {
          subject_id,
          title,
          summary: get("summary") || null,
          content,
          education_level: get("education_level") || "senior_high",
          grade_level: get("grade_level") || null,
          is_published: published,
        },
      });
      return;
    }

    const prompt = get("prompt");
    if (!prompt) return fail("Prompt is required.");
    const options = ["a", "b", "c", "d"].map((l) => ({
      id: l.toUpperCase(),
      text: get(`option_${l}`),
    }));
    if (options.some((o) => !o.text)) return fail("All four options (A–D) are required.");
    const correct = get("correct_option").toUpperCase();
    if (!["A", "B", "C", "D"].includes(correct))
      return fail("correct_option must be A, B, C or D.");
    const k = key(subject_id, prompt);
    if (seen.has(k)) return fail("Duplicate question — skipped.");
    seen.add(k);
    out.valid.push({
      line,
      value: {
        subject_id,
        prompt,
        options,
        correct_option: correct,
        explanation: get("explanation") || null,
        exam_type: get("exam_type") || "WASSCE",
        is_published: published,
      },
    });
  });
  return out;
}

export { key as duplicateKey };

export function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

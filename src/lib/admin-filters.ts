export type AdminFilter = {
  query: string;
  subjectId: string; // '' = all
  status: string; // 'all' | 'published' | 'draft'
  extra: string; // education level or exam type; '' = all
};

export const emptyFilter: AdminFilter = { query: "", subjectId: "", status: "all", extra: "" };

const norm = (v: string | null | undefined) => (v ?? "").toLowerCase();

export function matchesText(query: string, ...fields: (string | null | undefined)[]) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => norm(f).includes(q));
}

export function matchesFilter(
  f: AdminFilter,
  item: { subject_id?: number; is_published?: boolean },
  extraValue: string | null | undefined,
  ...text: (string | null | undefined)[]
) {
  if (!matchesText(f.query, ...text)) return false;
  if (f.subjectId && String(item.subject_id) !== f.subjectId) return false;
  if (f.status === "published" && !item.is_published) return false;
  if (f.status === "draft" && item.is_published) return false;
  if (f.extra && (extraValue ?? "") !== f.extra) return false;
  return true;
}

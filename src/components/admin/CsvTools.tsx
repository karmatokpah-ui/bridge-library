import { useRef, useState, type ChangeEvent } from "react";
import { Download, Upload } from "lucide-react";
import {
  COLUMNS,
  MAX_IMPORT_BYTES,
  downloadCsv,
  parseCsv,
  prepareImport,
  toCsv,
  type Kind,
  type Prepared,
  type RowIssue,
  type SubjectRef,
} from "@/lib/admin-csv";

type Props = {
  kind: Kind;
  label: string;
  subjects: SubjectRef[];
  exportRows: Array<Record<string, unknown>>;
  existingKeys: Set<string>;
  onImport: (
    rows: Array<{ line: number; value: never }>,
  ) => Promise<{ saved: number; failed: RowIssue[] }>;
};

export function CsvTools({ kind, label, subjects, exportRows, existingKeys, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Prepared<unknown> | null>(null);
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ saved: number; failed: RowIssue[] } | null>(null);
  const [error, setError] = useState("");

  function exportCsv() {
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(toCsv(COLUMNS[kind], exportRows), `bridgelib-${kind}-${date}.csv`);
  }

  function template() {
    downloadCsv(toCsv(COLUMNS[kind], []), `bridgelib-${kind}-template.csv`);
  }

  async function pick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    setError("");
    setResult(null);
    setPreview(null);
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please choose a .csv file.");
      return;
    }
    if (file.size > MAX_IMPORT_BYTES) {
      setError("The file is larger than 1 MB. Split it into smaller files.");
      return;
    }
    try {
      const rows = parseCsv(await file.text());
      // Overloads need a literal kind; the runtime function handles all three.
      setPreview(prepareImport(kind as "subjects", rows, subjects, existingKeys));
      setFileName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read the file.");
    }
  }

  async function confirm() {
    if (!preview?.valid.length) return;
    setBusy(true);
    setError("");
    try {
      setResult(await onImport(preview.valid as Array<{ line: number; value: never }>));
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bl-csv">
      <div className="bl-csv-actions">
        <button type="button" className="bl-btn bl-btn-outline bl-btn-sm" onClick={exportCsv}>
          <Download size={14} /> Export {exportRows.length} {label} (CSV)
        </button>
        <button
          type="button"
          className="bl-btn bl-btn-outline bl-btn-sm"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
        >
          <Upload size={14} /> Import CSV
        </button>
        <button type="button" className="bl-csv-link" onClick={template}>
          Download template
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          hidden
          onChange={(e) => void pick(e)}
          aria-label={`Import ${label} CSV`}
        />
      </div>

      {error && (
        <p className="status-message error" role="alert">
          {error}
        </p>
      )}

      {preview && (
        <div className="bl-csv-preview" role="status">
          <strong>{fileName}</strong>: {preview.valid.length} ready to import,{" "}
          {preview.issues.length} skipped.
          {kind !== "subjects" && " Rows marked unpublished are saved as drafts."}
          <IssueList issues={preview.issues} />
          <div className="bl-csv-actions">
            <button
              type="button"
              className="bl-btn bl-btn-primary bl-btn-sm"
              onClick={() => void confirm()}
              disabled={busy || preview.valid.length === 0}
            >
              {busy ? "Importing…" : `Import ${preview.valid.length} ${label}`}
            </button>
            <button
              type="button"
              className="bl-btn bl-btn-outline bl-btn-sm"
              onClick={() => setPreview(null)}
              disabled={busy}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {result && (
        <div
          className={`status-message ${result.failed.length ? "error" : "success"}`}
          role="status"
        >
          Imported {result.saved} {label}.{" "}
          {result.failed.length > 0 && `${result.failed.length} could not be saved.`}
          <IssueList issues={result.failed} />
        </div>
      )}
    </div>
  );
}

function IssueList({ issues }: { issues: RowIssue[] }) {
  if (!issues.length) return null;
  return (
    <ul className="bl-csv-issues">
      {issues.slice(0, 20).map((i, n) => (
        <li key={n}>
          Line {i.line}: {i.message}
        </li>
      ))}
      {issues.length > 20 && <li>…and {issues.length - 20} more.</li>}
    </ul>
  );
}

import { useEffect, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { WorkspaceShell } from "@/components/learning/Workspace";
import { supabase } from "@/lib/supabase";
import {
  saveSiteContent,
  siteContentQueryKey,
  siteFields,
  useSiteContent,
  type SiteContent,
} from "@/lib/site-content";

const hints: Partial<Record<string, string>> = {
  faq: "One question per block: write the question on the first line, the answer below it, and leave an empty line between questions.",
  terms: "Write each section as a heading on the first line and its text below. Leave an empty line between sections.",
  privacy: "Write each section as a heading on the first line and its text below. Leave an empty line between sections.",
};

export function SiteContentEditor() {
  const cache = useQueryClient();
  const admin = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return false;
      const { data: ok } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
      return Boolean(ok);
    },
  });
  const content = useSiteContent();
  const [values, setValues] = useState<SiteContent>({});
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (content.data) setValues(content.data);
  }, [content.data]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      await saveSiteContent(values);
      await cache.invalidateQueries({ queryKey: siteContentQueryKey });
      setMsg("Saved. Changes are live on the website.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <WorkspaceShell>
      <h1 className="bl-page-title">Website content</h1>
      <p className="bl-muted">
        Edit the intro video, contact details, social links, FAQs, Terms and Privacy Policy shown on the
        public website. <Link to="/management" className="bl-link">Back to platform management</Link>
      </p>
      {admin.isPending || content.isPending ? (
        <p>Loading…</p>
      ) : !admin.data ? (
        <p className="bl-notice">Only administrators can edit website content. Sign in with an admin account.</p>
      ) : (
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 16, maxWidth: 760, marginTop: 16 }}>
          {siteFields.map((f) => (
            <label key={f.key} style={{ display: "grid", gap: 6, fontWeight: 600 }}>
              {f.label}
              {f.type === "long" ? (
                <textarea
                  rows={8}
                  value={values[f.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  style={{ padding: 10, borderRadius: 10, border: "1px solid var(--bl-border)", fontWeight: 400 }}
                />
              ) : (
                <input
                  type={f.type}
                  value={values[f.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  style={{ padding: 10, borderRadius: 10, border: "1px solid var(--bl-border)", fontWeight: 400 }}
                />
              )}
              {hints[f.key] ? <small className="bl-muted" style={{ fontWeight: 400 }}>{hints[f.key]}</small> : null}
            </label>
          ))}
          <div>
            <button className="bl-btn bl-btn-primary" disabled={busy}>
              {busy ? "Saving…" : "Save website content"}
            </button>
          </div>
          {msg ? <p role="status" className="bl-notice">{msg}</p> : null}
        </form>
      )}
    </WorkspaceShell>
  );
}

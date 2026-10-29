import { useEffect, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { WorkspaceShell } from "@/components/learning/Workspace";
import { supabase } from "@/lib/supabase";
import { ContactLines } from "@/components/site/SiteChrome";
import { Sections } from "@/components/site/InfoPages";
import { resolveVideoSource } from "@/lib/video";
import {
  parseBlocks,
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
  const [preview, setPreview] = useState(false);
  const dirty = JSON.stringify(values) !== JSON.stringify(content.data ?? {});
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
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="bl-btn bl-btn-outline" onClick={() => setPreview(true)}>
              Preview changes
            </button>
            <button className="bl-btn bl-btn-primary" disabled={busy}>
              {busy ? "Saving…" : "Save website content"}
            </button>
          </div>
          {dirty ? <p className="bl-muted">You have unsaved changes. Visitors still see the old content.</p> : null}
          {msg ? <p role="status" className="bl-notice">{msg}</p> : null}
        </form>
      )}
      {preview ? (
        <SitePreview
          values={values}
          busy={busy}
          onClose={() => setPreview(false)}
          onSave={async () => {
            await onSubmit({ preventDefault() {} } as FormEvent);
            setPreview(false);
          }}
        />
      ) : null}
    </WorkspaceShell>
  );
}

const previewTabs = [
  ["video", "Watch Video"],
  ["footer", "Footer & contact"],
  ["faq", "FAQs"],
  ["terms", "Terms"],
  ["privacy", "Privacy"],
] as const;

function SitePreview({
  values,
  busy,
  onClose,
  onSave,
}: {
  values: SiteContent;
  busy: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const [tab, setTab] = useState<(typeof previewTabs)[number][0]>("video");
  const video = resolveVideoSource(values.video_url);
  const blocks = (k: "faq" | "terms" | "privacy") => parseBlocks(values[k]);
  return (
    <div className="bl-video-backdrop" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Preview website content"
        className="bl-card bl-preview-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bl-preview-bar">
          <b>Preview — not saved yet</b>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="bl-btn bl-btn-outline bl-btn-sm" onClick={onClose}>
              Keep editing
            </button>
            <button type="button" className="bl-btn bl-btn-primary bl-btn-sm" disabled={busy} onClick={onSave}>
              {busy ? "Saving…" : "Looks good — save"}
            </button>
          </div>
        </div>
        <div className="bl-chips" role="tablist">
          {previewTabs.map(([k, label]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k}
              className={`bl-chip ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>
              {label}
            </button>
          ))}
        </div>
        <div className="bl-preview-body">
          {tab === "video" &&
            (!values.video_url ? (
              <p className="bl-muted">No link yet — visitors will see a “Video coming soon” message.</p>
            ) : !video ? (
              <p className="bl-notice">This link can’t be played. Use a YouTube, Vimeo or .mp4 link.</p>
            ) : video.kind === "embed" ? (
              <iframe className="bl-video-frame" src={video.src} title="Video preview" allow="encrypted-media; picture-in-picture" allowFullScreen />
            ) : (
              <video className="bl-video-frame" src={video.src} controls playsInline />
            ))}
          {tab === "footer" && (
            <footer className="bl-footer" style={{ borderRadius: 12 }}>
              <div className="bl-container bl-footer-grid" style={{ gridTemplateColumns: "1fr" }}>
                <div>
                  <h4>Contact Us</h4>
                  <ContactLines content={values} />
                </div>
              </div>
            </footer>
          )}
          {tab === "faq" &&
            (blocks("faq").length ? (
              <div style={{ display: "grid", gap: 10 }}>
                {blocks("faq").map(([q, a]) => (
                  <details key={q} className="bl-card" style={{ padding: 16 }} open>
                    <summary style={{ fontWeight: 700, color: "var(--bl-navy)" }}>{q}</summary>
                    <p className="bl-muted" style={{ margin: "8px 0 0" }}>{a}</p>
                  </details>
                ))}
              </div>
            ) : (
              <p className="bl-muted">Empty — the website will keep showing the standard FAQs.</p>
            ))}
          {(tab === "terms" || tab === "privacy") &&
            (blocks(tab).length ? (
              <Sections items={blocks(tab)} />
            ) : (
              <p className="bl-muted">Empty — the website will keep showing the standard wording.</p>
            ))}
        </div>
      </div>
    </div>
  );
}

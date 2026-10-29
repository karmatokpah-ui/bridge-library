import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Decision = { data: { redirect_url?: string; redirect_to?: string; client?: { name?: string; client_name?: string }; redirect_uri?: string; scope?: string } | null; error: { message: string } | null };
type OAuthApi = {
  getAuthorizationDetails(id: string): Promise<Decision>;
  approveAuthorization(id: string): Promise<Decision>;
  denyAuthorization(id: string): Promise<Decision>;
};
const oauth = () => (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  head: () => ({ meta: [{ title: "Connect an app — BridgeLIB" }, { name: "description", content: "Approve or deny an app's access to your BridgeLIB account." }, { property: "og:title", content: "Connect an app — BridgeLIB" }, { property: "og:description", content: "Approve or deny an app's access to your BridgeLIB account." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ authorization_id: typeof s["authorization_id"] === "string" ? s["authorization_id"] : "" }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("This connection link is missing its request ID.");
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ href: `/?auth=login&next=${encodeURIComponent(location.pathname + location.searchStr)}` });
  },
  loader: async ({ location }) => {
    const id = new URLSearchParams(location.search).get("authorization_id") ?? "";
    const { data, error } = await oauth().getAuthorizationDetails(id);
    if (error) throw new Error(error.message || "This connection request is invalid or has expired.");
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    const { data: s } = await supabase.auth.getSession();
    return { details: data, email: s.session?.user.email ?? "" };
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="bl-consent"><div className="bl-consent-card"><h1>Couldn't load this request</h1><p>{error instanceof Error ? error.message : String(error)}</p><a href="/">Back to BridgeLIB</a></div></main>
  ),
});

function Consent() {
  const { details, email } = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const name = details?.client?.name ?? details?.client?.client_name ?? "An app";
  const scopes = (details?.scope ?? "").split(/\s+/).filter(Boolean);
  const label = (s: string) => s === "email" ? "Share your email address" : s === "profile" ? "Share your basic profile" : s === "openid" ? "Confirm your identity" : `Additional permission requested: ${s}`;

  async function decide(approve: boolean) {
    setBusy(true); setError(null);
    const { data, error } = approve ? await oauth().approveAuthorization(authorization_id) : await oauth().denyAuthorization(authorization_id);
    const target = data?.redirect_url ?? data?.redirect_to;
    if (error || !target) { setBusy(false); setError(error?.message ?? "No redirect was returned. Please try again."); return; }
    window.location.href = target;
  }

  return (
    <main className="bl-consent">
      <div className="bl-consent-card">
        <h1>Connect {name} to BridgeLIB</h1>
        <p>Signed in as <strong>{email}</strong></p>
        <p>{name} will be able to use BridgeLIB's tools as you: browse subjects and lessons, see your progress, and mark lessons complete.</p>
        {details?.redirect_uri && <p className="bl-consent-muted">Returns to {details.redirect_uri}</p>}
        {scopes.length > 0 && <ul>{scopes.map((s) => <li key={s}>{label(s)}</li>)}</ul>}
        <p className="bl-consent-muted">This does not bypass BridgeLIB's permissions.</p>
        {error && <p role="alert" className="bl-consent-error">{error}</p>}
        <div className="bl-consent-actions">
          <button className="bl-consent-approve" disabled={busy} onClick={() => decide(true)}>Approve</button>
          <button className="bl-consent-deny" disabled={busy} onClick={() => decide(false)}>Cancel connection</button>
        </div>
      </div>
    </main>
  );
}

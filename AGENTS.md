<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture decisions

- BridgeLIB was ported from the Exploit-009/BridgeLIB repo (Vite + wouter SPA) into this TanStack Start app. Pages live in `src/components/BridgeApp.tsx` (`BridgeHome` handles `/` and `/admin` by pathname, `PracticePage` handles `/practice`); routes are thin wrappers in `src/routes/`. Why: TanStack Router is fixed in this stack, so wouter was replaced with `Link to=`/`useNavigate`/`useRouterState`.
- Preserve the original external BridgeLIB backend in `src/lib/supabase.ts`. New server functions validate the original backend's user through `src/lib/bridge-auth.ts`; do not use integration-managed clients or middleware while editor bindings target a different database. Why: prevent an unintended editor connection change from replacing production data or sessions.
- The source repo's Express `api-server` was intentionally not ported: its only route is a health check and no app logic depends on it. Why: all data/auth flows run browser-to-Supabase.
- Only the shadcn components BridgeLIB actually uses are kept in `src/components/ui/` (currently just `dialog.tsx`); the rest were deleted because the stricter tsconfig (`exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`) rejects the upstream copies.
- Shared site chrome (header, footer, subject icons, empty/skeleton states) lives in `src/components/site/SiteChrome.tsx`; redesign styles use `bl-*` classes at the end of `src/styles.css`. Header Login/Sign Up links use `/?auth=login|signup`, which `BridgeHome` reads to open the existing auth form. Why: one design system reused by every page without touching auth logic.
- Backend end-to-end tests live in `src/test/e2e/` and run against the real external Supabase with the publishable key and dedicated test accounts from `E2E_*` env vars; they skip when credentials are absent, and writes only run with `E2E_ALLOW_WRITES=1` and revert themselves. Why: verify sign-in and access rules without touching production data or using secret keys.
- Admin CSV import/export: pure parsing/validation in `src/lib/admin-csv.ts`, UI in `src/components/admin/CsvTools.tsx`, database writes in `importRows` in the admin page using the signed-in admin session. Imports are insert-only, row by row, skipping duplicates. Why: no schema changes, existing access rules decide what each user can save.
- New learning and management pages call `src/lib/learning.functions.ts`; database access stays user-scoped and role authorization uses protected user_roles. Why: page visibility is not the permission boundary.
- `src/start.ts` registers only `attachBridgeAuth` as function middleware; never add the integration `attachSupabaseAuth`. Why: the integration client has no env here and throws, breaking every server call (e.g. home page courses).
- Admin-editable website content (video link, contact details, socials, FAQ, Terms, Privacy) is stored as `site.*` rows in `feature_settings` (value in `label`), edited at `/site-content`, read via `src/lib/site-content.ts`. Why: no schema change on the external backend; existing admin-only write and public read rules apply.

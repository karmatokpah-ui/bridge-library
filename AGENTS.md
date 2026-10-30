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
- Keep only used UI primitives; AI Elements chat primitives use the shared Button's compatible variants/sizes. Why: preserve BridgeLIB styling while supporting the stricter TypeScript settings.
- Shared site chrome (header, footer, subject icons, empty/skeleton states) lives in `src/components/site/SiteChrome.tsx`; redesign styles use `bl-*` classes at the end of `src/styles.css`. Header Login/Sign Up links use `/?auth=login|signup`, which `BridgeHome` reads to open the existing auth form. Why: one design system reused by every page without touching auth logic.
- Backend end-to-end tests live in `src/test/e2e/` and run against the real external Supabase with the publishable key and dedicated test accounts from `E2E_*` env vars; they skip when credentials are absent, and writes only run with `E2E_ALLOW_WRITES=1` and revert themselves. Why: verify sign-in and access rules without touching production data or using secret keys.
- Admin CSV import/export: pure parsing/validation in `src/lib/admin-csv.ts`, UI in `src/components/admin/CsvTools.tsx`, database writes in `importRows` in the admin page using the signed-in admin session. Imports are insert-only, row by row, skipping duplicates. Why: no schema changes, existing access rules decide what each user can save.
- New learning and management pages call `src/lib/learning.functions.ts`; database access stays user-scoped and role authorization uses protected user_roles. Why: page visibility is not the permission boundary.
- `src/start.ts` registers only `attachBridgeAuth` as function middleware; never add the integration `attachSupabaseAuth`. Why: the integration client has no env here and throws, breaking every server call (e.g. home page courses).
- Admin-editable website content (video link, contact details, socials, FAQ, Terms, Privacy) is stored as `site.*` rows in `feature_settings` (value in `label`), edited at `/site-content`, read via `src/lib/site-content.ts`. Why: no schema change on the external backend; existing admin-only write and public read rules apply.
- Practice test UI lives in `src/components/practice/PracticeView.tsx`; loading, grading, and learning-mode feedback state stay in `PracticePage` in BridgeApp.tsx. Why: preserve server grading while supporting the reference's immediate practice explanations.
- Practice tests accept published database question IDs only; material pages separate published school records from labeled original revision content. Student contact metadata is self-reported and photos use private owner-scoped storage. Why: avoid fabricated exam provenance, client grading and verification claims.
- Reference student navigation is shared in `StudentSidebar.tsx`; learner pages live in `LearnerPages.tsx` behind thin leaf routes. Why: keep all reference menu destinations consistent without duplicating navigation.
- Student dashboard presentation lives in `StudentDashboard.tsx`, reusing workspace/course reads; study goals use auth user metadata, never authorization decisions. Why: save personal targets without changing the external database schema.
- Dashboard record availability uses `dashboard-records.functions.ts`: exact issued-certificate counts scoped to the authenticated owner; schedules and verification remain unavailable until confirmed authoritative sources exist. Why: goals, roles and email confirmation are not official exam dates or student verification.
- Study Guide uses route-owned threads, original-backend owner-scoped history, and server-read learning records; AI Gateway Responses streams through `/api/study-chat`. Pending account-storage SQL must only run on the original backend. Why: prevent cross-account history and fabricated personalized data.
- Study Guide steps and individual lessons use original-backend published lessons and owner-scoped progress; recommendations receive exact allowlisted destinations, with completion using the existing learning action and shared cache invalidation. Why: students can follow real recommendations without new storage or fabricated learning content.
- Reference bookmarks, ratings, certificates, aggregate metrics and practice feedback use `reference.functions.ts` with original BridgeLIB auth; SQL in `supabase/manual/reference-image-features.sql` is pending and must only be applied to the original backend after editor reconnection. Why: never mutate the unrelated editor-bound database or invent live statistics.

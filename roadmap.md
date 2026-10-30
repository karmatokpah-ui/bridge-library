# BridgeLIB completion

- [ ] Match the new student dashboard reference: welcome banner, shared student sidebar, course/stat cards, quick actions, progress, activity, upcoming exam preparation, goals editor and education banner; preserve real account data.
- [x] Align home, courses, and practice layouts; remove unrelated home sections; add all reference student menu destinations and course metric positions.
- [x] Implement bookmarks, ratings, completion certificates, downloads, profile, enrolled courses, progress and immediate practice feedback code on the original backend.
- [ ] Activate bookmarks, ratings, certificates, public aggregate metrics and immediate real-question feedback: blocked by restoring the original editor data connection and applying the pending SQL to that project only.
- [ ] Verify saved features with a real signed-in account: blocked by unavailable external-backend test session. Public links, filters, desktop/mobile layout and sample practice were checked; these do not verify real signed-in flows.

- [x] Confirm the existing external Supabase connection and record database-change authorization.
- [x] Review live schema, access policies, security warnings, and existing automated checks.
- [x] Approve the completion plan after the feature inventory.
- [x] Add protected roles, access repairs, progress and assignment schema to the original external backend.
- [x] Add course lessons, learner progress, homepage links, teacher classes/assignments and management pages.
- [ ] Finish remaining refinements (per-class teacher UI, pagination, server-side feature availability, detailed permission regression tests): blocked by restoring the external editor connection for further schema validation.
- [ ] Verify student, teacher, and admin workflows with isolated accounts.

Connection blocker: an unintended Cloud enable action changed editor bindings to a separate empty Cloud backend. The app explicitly remains on the original external BridgeLIB backend. Do not run more database tools against the new backend. External connection recovery requires workspace settings access; no safe reconnection tool is available.
Testing blocker: dedicated signed-in test accounts are not currently configured; authenticated end-to-end checks are unavailable for the external unmanaged backend.
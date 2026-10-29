# Complete BridgeLIB on its existing Supabase project

## Confirmed starting point
- BridgeLIB is already connected to the existing external Supabase project `qlwtccmvddhgdnknrgnh`; no new project or Lovable Cloud is needed.
- Home, authentication, learner onboarding, school applications, practice exams, and admin subjects/lessons/questions with CSV tools already exist. Preserve their design and working actions.
- The live database already contains classes, teacher assignments, memberships, exam papers, scholarships, subscriptions, and invoices. Teacher workflows, course details, and feature management are not yet implemented.
- Live access grants currently prevent authenticated lesson reads/writes and profile updates. These must be repaired, not worked around with privileged browser access.
- Current helper/routing checks pass: 10 tests. Dedicated student/admin test credentials are absent, so signed-in workflows are not yet verified.

## 1. Repair the connection and security foundation
- Consolidate the existing app onto the integration-managed Supabase client so all pages share one session and the connected project configuration.
- Keep email sign-in, signup confirmation, recovery, onboarding, and sign-out working; avoid changing provider settings silently.
- Move authorization from `profiles.role` into a protected user-role table. Preserve existing assigned roles, update every dependent access rule, and prevent users from granting themselves teacher or administrator privileges. Keep any legacy profile role only as a read-only compatibility field during transition.
- Repair missing grants, owner/draft read paths, and class access policies; avoid recursive membership checks. Protect private profiles, submissions, payment records, and answer keys.
- Keep server-side exam grading. Make question-plus-answer saves atomic, including CSV imports.

## 2. Complete courses and learner workflows
- Make the subject catalogue available to visitors, without exposing learner data or unpublished content. Connect homepage categories and featured subjects to real records.
- Add course/subject detail pages with published lessons, lesson reading, subject-specific practice, and clear empty states.
- Add the minimum enrollment and lesson-completion records needed for saved learning progress. Show real enrolled courses, completed lessons, and exam history on the learner dashboard.
- Connect WASSCE subject selection to the correct practice questions. Provide real published paper listings and authorized downloads from the existing private bucket; never fabricate papers.
- Add profile/settings editing for permitted fields and a signed-in password change form that requires the current password.

## 3. Build the teacher dashboard
- Reuse the navy sidebar and existing card/table design.
- Let approved teachers create/manage their classes, see assigned classes, manage class invitations, and see only enrolled students relevant to those classes.
- Add secure invite redemption with expiry, revocation, and usage limits; students can join only through an authorized invitation.
- Add assignments and submissions if the existing schema cannot support them. Teachers create assignments for their classes, learners submit their own work, and assigned teachers grade it with feedback.
- Show counts and progress from actual class activity, not sample students or invented statistics.

## 4. Complete the admin panel and feature management
- Preserve subject, lesson, question, search/filter, publish, and CSV workflows; add safe pagination and clear save/import failures.
- Add school application review, teacher/class oversight, and controlled user-role management. Prevent accidental removal of the last administrator.
- Add exam-paper and scholarship management using existing tables, with publication controls and secure file handling.
- Add a feature-management page for enabling/disabling available learning sections. Persist settings with admin-only changes; feature toggles control availability, never substitute for permission checks.
- Surface existing subscription plans and invoice/payment records where authorized. Do not fake successful payments or enable paid checkout without a configured provider.

## 5. Verify and finish
- Add focused tests for permissions, invite rules, enrollment/progress, grading, feature settings, and atomic admin writes.
- Run the existing tests and new regression tests; check preview build diagnostics.
- Exercise public navigation, course/lesson reading, practice submission/review, profile saving, teacher assignments, and admin publishing through the UI.
- Use isolated test accounts and clearly marked test records. Never delete or modify unrelated production data. If authenticated checks remain unavailable, explicitly mark them unverified rather than claiming completion.
- Check narrow-screen forms, dashboard navigation, tables, and quiz controls; retain the established visual design.

## Technical approach
- Use TanStack routes and reusable feature modules; keep existing public URLs working and add unique page metadata.
- New app-internal reads/writes use authenticated `createServerFn` handlers with user-scoped Supabase access; public catalogue reads use narrow public-read policies. Every server endpoint validates authentication, roles, and inputs independently of its page.
- Submit all database changes through the migration tool, with explicit grants, RLS, validation, timestamps, and indexes. Prefer additive changes; migrate role data without resetting existing tables.
- Treat new feature switches as availability controls only. Database authorization remains enforced even when pages or buttons are hidden.

## Boundaries and completion criteria
- No replacement database, destructive reset, repository connection/push, automatic publishing, fabricated content, or exposed secrets.
- Payment-provider setup, third-party sign-in configuration, and verified contact details are outside automatic completion when external configuration is required.
- Completion means the listed implemented flows save and read back real data, access checks pass, and any remaining external setup or unverified signed-in flow is identified clearly.
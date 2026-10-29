import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireBridgeAuth as requireSupabaseAuth } from "./bridge-auth";
import { BRIDGE_SUPABASE_URL, BRIDGE_PUBLISHABLE_KEY } from './supabase';
import { assignmentSchema, classSchema, gradeSchema, roleSchema, submissionSchema } from "./learning-schema";

export const publicCatalogue = createServerFn({ method: "GET" }).handler(async () => {
  const url = BRIDGE_SUPABASE_URL; const key = BRIDGE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("The catalogue is temporarily unavailable.");
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => { const headers = new Headers(init?.headers); if (headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization'); headers.set('apikey', key); return fetch(input, { ...init, headers }); } } });
  const [subjects, features] = await Promise.all([client.from('subjects').select('id,name,description').order('name'), client.from('feature_settings').select('key,label,enabled').order('label')]);
  if (subjects.error || features.error) throw new Error("The catalogue could not be loaded.");
  return { subjects: subjects.data ?? [], features: features.data ?? [] };
});

export const workspaceData = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context: { supabase, userId } }) => {
  const results = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(), supabase.from('user_roles').select('role').eq('user_id', userId),
    supabase.from('subjects').select('id,name,description').order('name'), supabase.from('classes').select('*').order('created_at', { ascending: false }),
    supabase.from('class_memberships').select('*'), supabase.from('class_assignments').select('*').order('created_at', { ascending: false }),
    supabase.from('assignment_submissions').select('*'), supabase.from('course_enrollments').select('*'),
    supabase.from('lesson_completions').select('*'), supabase.from('exam_attempts').select('*').eq('user_id', userId).order('submitted_at', { ascending: false }).limit(100),
    supabase.from('feature_settings').select('*'), supabase.from('class_invites').select('id,class_id,expires_at,max_uses,use_count,revoked_at'),
  ]);
  const failure = results.find(r => r.error); if (failure?.error) throw new Error(failure.error.message);
  return { userId, profile: results[0]?.data, roles: results[1]?.data ?? [], subjects: results[2]?.data ?? [], classes: results[3]?.data ?? [], memberships: results[4]?.data ?? [], assignments: results[5]?.data ?? [], submissions: results[6]?.data ?? [], enrollments: results[7]?.data ?? [], completions: results[8]?.data ?? [], attempts: results[9]?.data ?? [], features: results[10]?.data ?? [], invites: results[11]?.data ?? [] };
});

export const courseData = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((v: unknown) => z.number().int().positive().parse(v)).handler(async ({ data, context: { supabase, userId } }) => {
  const [subject, lessons, completions, enrollment] = await Promise.all([supabase.from('subjects').select('*').eq('id', data).single(), supabase.from('lessons').select('*').eq('subject_id', data).eq('is_published', true).order('created_at'), supabase.from('lesson_completions').select('lesson_id').eq('user_id', userId), supabase.from('course_enrollments').select('id').eq('user_id', userId).eq('subject_id', data)]);
  for (const r of [subject, lessons, completions, enrollment]) if (r.error) throw new Error(r.error.message);
  if (!subject.data) throw new Error('Course not found.');
  return { subject: subject.data, lessons: lessons.data ?? [], completions: completions.data ?? [], enrolled: Boolean(enrollment.data?.length) };
});

export const learningAction = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((v: unknown) => z.discriminatedUnion('kind', [z.object({ kind: z.literal('enroll'), subject_id: z.number().int().positive() }), z.object({ kind: z.literal('complete'), lesson_id: z.string().uuid() }), z.object({ kind: z.literal('join'), code: z.string().trim().min(1).max(100) })]).parse(v)).handler(async ({ data, context: { supabase, userId } }) => {
  const r = data.kind === 'enroll' ? await supabase.from('course_enrollments').upsert({ user_id: userId, subject_id: data.subject_id }, { onConflict: 'user_id,subject_id', ignoreDuplicates: true }) : data.kind === 'complete' ? await supabase.from('lesson_completions').upsert({ user_id: userId, lesson_id: data.lesson_id }, { onConflict: 'user_id,lesson_id', ignoreDuplicates: true }) : await supabase.rpc('redeem_class_invite', { p_code: data.code });
  if (r.error) throw new Error(r.error.message); return { ok: true };
});

export const teacherAction = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((v: unknown) => z.discriminatedUnion('kind', [z.object({ kind: z.literal('class'), value: classSchema }), z.object({ kind: z.literal('assignment'), value: assignmentSchema }), z.object({ kind: z.literal('submission'), value: submissionSchema }), z.object({ kind: z.literal('grade'), value: gradeSchema }), z.object({ kind: z.literal('invite'), class_id: z.string().uuid(), days: z.number().int().min(1).max(30), max_uses: z.number().int().min(1).max(1000) }), z.object({ kind: z.literal('revoke'), id: z.string().uuid() }), z.object({ kind: z.literal('archive'), id: z.string().uuid() }), z.object({ kind: z.literal('remove_member'), id: z.string().uuid() })]).parse(v)).handler(async ({ data, context: { supabase, userId } }) => {
  let r;
  if (data.kind === 'class') r = await supabase.from('classes').insert({ ...data.value, created_by: userId });
  else if (data.kind === 'assignment') r = await supabase.from('class_assignments').insert({ ...data.value, created_by: userId });
  else if (data.kind === 'submission') {
    const existing = await supabase.from('assignment_submissions').select('id').eq('assignment_id', data.value.assignment_id).eq('student_id', userId).maybeSingle(); if (existing.error) throw new Error(existing.error.message);
    r = existing.data ? await supabase.from('assignment_submissions').update({ work: data.value.work }).eq('id', existing.data.id).select('id').single() : await supabase.from('assignment_submissions').insert({ ...data.value, student_id: userId }).select('id').single();
  }
  else if (data.kind === 'grade') r = await supabase.from('assignment_submissions').update({ score: data.value.score, feedback: data.value.feedback, graded_by: userId }).eq('id', data.value.id).select('id').single();
  else if (data.kind === 'invite') r = await supabase.rpc('create_class_invite', { p_class_id: data.class_id, p_days: data.days, p_max_uses: data.max_uses });
  else if (data.kind === 'revoke') r = await supabase.from('class_invites').update({ revoked_at: new Date().toISOString() }).eq('id', data.id).select('id').single();
  else if (data.kind === 'archive') r = await supabase.from('classes').update({ status: 'archived' }).eq('id', data.id).select('id').single();
  else r = await supabase.from('class_memberships').delete().eq('id', data.id).select('id').single();
  if (r.error) throw new Error(r.error.message); return { ok: true, code: typeof r.data === 'string' ? r.data : null };
});

export const adminData = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context: { supabase, userId } }) => {
  const role = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' }); if (role.error || !role.data) throw new Error('Administrator access required.');
  const tables = ['profiles','user_roles','schools','classes','exam_papers','scholarships','subscription_plans','school_invoices','school_payment_transactions','premium_payment_transactions','feature_settings'] as const;
  const results = await Promise.all(tables.map(table => supabase.from(table).select('*').limit(1000)));
  for (const r of results) if (r.error) throw new Error(r.error.message);
  return Object.fromEntries(tables.map((table,i) => [table, results[i]?.data ?? []])) as Record<string, Array<Record<string, any>>>;
});

export const adminAction = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((v: unknown) => z.discriminatedUnion('kind', [z.object({ kind: z.literal('role'), user_id: z.string().uuid(), role: roleSchema }), z.object({ kind: z.literal('feature'), key: z.string().max(80), enabled: z.boolean() }), z.object({ kind: z.literal('school'), id: z.string().uuid(), status: z.enum(['verified','rejected','pending']) }), z.object({ kind: z.literal('paper'), id: z.number().int().positive().nullable(), title: z.string().trim().min(1).max(200), examination: z.string().trim().min(1).max(80), exam_year: z.number().int().min(1950).max(2100), subject_id: z.number().int().positive(), file_path: z.string().trim().min(1).max(500), is_published: z.boolean() }), z.object({ kind: z.literal('scholarship'), id: z.number().int().positive().nullable(), title: z.string().trim().min(1).max(200), organization: z.string().max(200), description: z.string().max(10000), application_url: z.string().url().refine(v => v.startsWith('https://')), deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), is_published: z.boolean() })]).parse(v)).handler(async ({ data, context: { supabase, userId } }) => {
  const role = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' }); if (role.error || !role.data) throw new Error('Administrator access required.');
  let r;
  if (data.kind === 'role') r = await supabase.rpc('set_user_role', { p_user_id: data.user_id, p_role: data.role });
  else if (data.kind === 'feature') r = await supabase.from('feature_settings').update({ enabled: data.enabled }).eq('key', data.key).select('key').single();
  else if (data.kind === 'school') r = await supabase.from('schools').update({ status: data.status }).eq('id', data.id).select('id').single();
  else if (data.kind === 'paper') { const { kind, id, ...value } = data; r = id ? await supabase.from('exam_papers').update(value).eq('id', id).select('id').single() : await supabase.from('exam_papers').insert(value).select('id').single(); }
  else { const { kind, id, ...value } = data; r = id ? await supabase.from('scholarships').update(value).eq('id', id).select('id').single() : await supabase.from('scholarships').insert(value).select('id').single(); }
  if (r.error) throw new Error(r.error.message); return { ok: true };
});

export const resourceData = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context: { supabase } }) => {
  const [papers, scholarships] = await Promise.all([supabase.from('exam_papers').select('*').eq('is_published', true).order('exam_year',{ascending:false}),supabase.from('scholarships').select('*').eq('is_published', true).order('deadline')]);
  if (papers.error || scholarships.error) throw new Error('Resources could not be loaded.'); return { papers: papers.data ?? [], scholarships: scholarships.data ?? [] };
});
export const paperDownload = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((v: unknown) => z.number().int().positive().parse(v)).handler(async ({ data, context: { supabase } }) => {
  const paper = await supabase.from('exam_papers').select('file_path').eq('id',data).eq('is_published',true).single(); if (paper.error || !paper.data.file_path) throw new Error('Paper unavailable.');
  const signed = await supabase.storage.from('exam-papers').createSignedUrl(paper.data.file_path,60); if (signed.error) throw new Error(signed.error.message); return signed.data.signedUrl;
});
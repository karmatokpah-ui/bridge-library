import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { requireBridgeAuth } from './bridge-auth';
import { BRIDGE_SUPABASE_URL, BRIDGE_PUBLISHABLE_KEY } from './supabase';
import { bookmarkSchema, ratingSchema, type CourseMetric } from './reference-features';

const unavailable = 'This feature is waiting for the original website data connection to be restored.';
export const catalogueMetrics = createServerFn({ method: 'GET' }).handler(async () => {
  const client = createClient(BRIDGE_SUPABASE_URL, BRIDGE_PUBLISHABLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.rpc('bridge_course_metrics');
  return { metrics: error ? [] : (data ?? []) as CourseMetric[], available: !error };
});
export const savedCourses = createServerFn({ method: 'POST' }).middleware([requireBridgeAuth]).handler(async ({ context }) => {
  const result = await context.supabase.from('bridge_bookmarks').select('subject_id').eq('user_id', context.userId);
  if (result.error) throw new Error(unavailable);
  return (result.data ?? []) as Array<{ subject_id: number }>;
});
export const bookmarkCourse = createServerFn({ method: 'POST' }).middleware([requireBridgeAuth]).inputValidator((v: unknown) => bookmarkSchema.parse(v)).handler(async ({ data, context }) => {
  const result = data.saved ? await context.supabase.from('bridge_bookmarks').upsert({ user_id: context.userId, subject_id: data.subject_id }, { onConflict: 'user_id,subject_id' }) : await context.supabase.from('bridge_bookmarks').delete().eq('user_id', context.userId).eq('subject_id', data.subject_id);
  if (result.error) throw new Error(unavailable);
  return { ok: true };
});
export const rateCourse = createServerFn({ method: 'POST' }).middleware([requireBridgeAuth]).inputValidator((v: unknown) => ratingSchema.parse(v)).handler(async ({ data, context }) => {
  const result = await context.supabase.from('bridge_ratings').upsert({ ...data, user_id: context.userId }, { onConflict: 'user_id,subject_id' });
  if (result.error) throw new Error(unavailable);
  return { ok: true };
});
export const myCertificates = createServerFn({ method: 'POST' }).middleware([requireBridgeAuth]).handler(async ({ context }) => {
  const result = await context.supabase.rpc('bridge_my_certificates');
  if (result.error) throw new Error(unavailable);
  return (result.data ?? []) as Array<{ id: string; subject_id: number; subject_name: string; learner_name: string; issued_at: string }>;
});
export const issueCertificate = createServerFn({ method: 'POST' }).middleware([requireBridgeAuth]).inputValidator((v: unknown) => z.number().int().positive().parse(v)).handler(async ({ data, context }) => {
  const result = await context.supabase.rpc('bridge_issue_certificate', { p_subject: data });
  if (result.error) throw new Error(result.error.code === 'P0001' ? result.error.message : unavailable);
  return { ok: true };
});
export const practiceFeedback = createServerFn({ method: 'POST' }).middleware([requireBridgeAuth]).inputValidator((v: unknown) => z.object({ question_id: z.string().uuid(), selected_option: z.string().max(200) }).parse(v)).handler(async ({ data, context }) => {
  const result = await context.supabase.rpc('bridge_practice_feedback', { p_question: data.question_id, p_option: data.selected_option });
  if (result.error) throw new Error(unavailable);
  return result.data as { question_id: string; correct_option: string; explanation: string | null; is_correct: boolean };
});

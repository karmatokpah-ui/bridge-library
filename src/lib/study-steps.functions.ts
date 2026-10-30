import { createServerFn } from '@tanstack/react-start';
import { requireBridgeAuth } from './bridge-auth';
import { courseProgress } from './dashboard-stats';
import { incompleteStudyLessons } from './study-destinations';

export const studySteps = createServerFn({method:'POST'}).middleware([requireBridgeAuth]).handler(async ({context:{supabase,userId}}) => {
  const [enrollments, subjects, lessons, completions] = await Promise.all([
    supabase.from('course_enrollments').select('subject_id').eq('user_id',userId),
    supabase.from('subjects').select('id,name,description').order('name'),
    supabase.from('lessons').select('id,subject_id,title,summary').eq('is_published',true).order('created_at'),
    supabase.from('lesson_completions').select('lesson_id').eq('user_id',userId),
  ]);
  if ([enrollments,subjects,lessons,completions].some(r=>r.error)) throw new Error('Your study steps could not be loaded. Please try again.');
  const enrolled = new Set((enrollments.data??[]).map(e=>e.subject_id));
  return (subjects.data??[]).filter(s=>enrolled.has(s.id)).map(subject=>{
    const courseLessons=(lessons.data??[]).filter(l=>l.subject_id===subject.id);
    return {subject, total:courseLessons.length, progress:courseProgress(courseLessons.map(l=>l.id),(completions.data??[]).map(c=>c.lesson_id)), nextLessons:incompleteStudyLessons(courseLessons,completions.data??[])};
  });
});
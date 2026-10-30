export const STUDY_LINK_INSTRUCTIONS = `Use Markdown links for actionable steps. Use ONLY the exact URLs supplied in the learning records: courseUrl, practiceUrl, and nextLessons[].url. Never invent a course or lesson ID or another destination. Link to [Study steps](/study-guide/steps) for the learner's current incomplete lessons, [My progress](/progress) to review saved results, or [Study resources](/downloads) for published exam papers. If no applicable lesson exists, say so instead of fabricating one.`;

export function studyCourseDestinations(subjectId: number) {
  return { courseUrl: `/courses/${subjectId}`, practiceUrl: `/practice?subject=${subjectId}` };
}

export function studyLessonUrl(subjectId: number, lessonId: string) {
  return `/study-guide/lessons/${subjectId}/${lessonId}`;
}

export type StudyDestination =
  | { kind: 'course'; subjectId: string }
  | { kind: 'lesson'; subjectId: string; lessonId: string }
  | { kind: 'practice'; subject?: string }
  | { kind: 'page'; to: '/study-guide/steps' | '/progress' | '/downloads' | '/courses' | '/dashboard' | '/my-courses' | '/study-guide' };

export function resolveStudyDestination(href: string): StudyDestination | null {
  // Accept only explicitly supported same-app paths, never external/model-authored URLs.
  if (!href.startsWith('/') || href.startsWith('//')) return null;
  const course = /^\/courses\/([1-9]\d*)$/.exec(href);
  if (course?.[1]) return { kind: 'course', subjectId: course[1] };
  const lesson = /^\/study-guide\/lessons\/([1-9]\d*)\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.exec(href);
  if (lesson?.[1] && lesson[2]) return { kind: 'lesson', subjectId: lesson[1], lessonId: lesson[2] };
  if (href === '/practice') return { kind: 'practice' };
  const practice = /^\/practice\?subject=([1-9]\d*)$/.exec(href);
  if (practice?.[1]) return { kind: 'practice', subject: practice[1] };
  switch (href) {
    case '/study-guide/steps': case '/progress': case '/downloads': case '/courses':
    case '/dashboard': case '/my-courses': case '/study-guide':
      return { kind: 'page', to: href };
    default: return null;
  }
}

export function incompleteStudyLessons<T extends { id: string }>(lessons: T[], completions: { lesson_id: string }[]) {
  const completed = new Set(completions.map(c => c.lesson_id));
  return lessons.filter(l => !completed.has(l.id)).slice(0, 3);
}
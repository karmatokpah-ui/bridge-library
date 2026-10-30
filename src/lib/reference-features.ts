import { z } from 'zod';

export const bookmarkSchema = z.object({ subject_id: z.number().int().positive(), saved: z.boolean() });
export const ratingSchema = z.object({ subject_id: z.number().int().positive(), rating: z.number().int().min(1).max(5) });
export const featuredSubjectNames = ['Mathematics', 'English Language', 'Biology', 'Chemistry', 'Physics'];
export function referenceSubjects<T extends { name: string }>(subjects: T[]) {
  return featuredSubjectNames.flatMap(name => subjects.filter(s => s.name.toLowerCase() === name.toLowerCase()));
}
export function completionEligible(published: string[], completed: string[], enrolled: boolean) {
  return enrolled && published.length > 0 && published.every(id => completed.includes(id));
}
export type CourseMetric = { subject_id: number; lesson_count: number; student_count: number; rating_count: number; rating_average: number | null };

import { describe, expect, it } from 'vitest';
import { incompleteStudyLessons, resolveStudyDestination, studyCourseDestinations, studyLessonUrl } from './study-destinations';
describe('actionable student study steps', () => {
  it('links a recommendation to its exact course and subject practice', () => {
    expect(studyCourseDestinations(7)).toEqual({ courseUrl: '/courses/7', practiceUrl: '/practice?subject=7' });
    expect(resolveStudyDestination('/practice?subject=7')).toEqual({kind:'practice',subject:'7'});
  });
  it('opens the exact recommended lesson within its subject', () => {
    const id = '1a000000-0000-4000-8000-000000000001';
    expect(resolveStudyDestination(studyLessonUrl(7, id))).toEqual({kind:'lesson',subjectId:'7',lessonId:id});
  });
  it('only suggests incomplete lessons in course order', () => {
    expect(incompleteStudyLessons([{id:'a'},{id:'b'},{id:'c'},{id:'d'},{id:'e'}],[{lesson_id:'a'}]).map(l=>l.id)).toEqual(['b','c','d']);
  });
  it('does not invent next lessons when all are complete', () => {
    expect(incompleteStudyLessons([{id:'a'}],[{lesson_id:'a'}])).toEqual([]);
  });
  it.each(['https://other.example/courses/7','//other.example','/admin','/courses/NaN','/study-guide/lessons/7/missing'])('rejects unsupported recommendation destination %s', href => {
    expect(resolveStudyDestination(href)).toBeNull();
  });
});
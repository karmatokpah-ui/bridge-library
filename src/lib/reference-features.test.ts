import { describe, expect, it } from 'vitest';
import { bookmarkSchema, ratingSchema, referenceSubjects, completionEligible } from './reference-features';
describe('reference feature rules', () => {
  it('saves bookmarks against an actual positive subject identifier', () => {
    expect(bookmarkSchema.safeParse({ subject_id: 2, saved: true }).success).toBe(true);
    expect(bookmarkSchema.safeParse({ subject_id: 0, saved: true }).success).toBe(false);
  });
  it('uses five-star ratings rather than accepting arbitrary scores', () => {
    expect(ratingSchema.safeParse({ subject_id: 2, rating: 5 }).success).toBe(true);
    expect(ratingSchema.safeParse({ subject_id: 2, rating: 6 }).success).toBe(false);
  });
  it('features the five subjects shown in the home reference', () => {
    expect(referenceSubjects([{ name: 'Accounting' }, { name: 'Physics' }, { name: 'Mathematics' }]).map(s => s.name)).toEqual(['Mathematics', 'Physics']);
  });
  it('does not issue an empty, incomplete or unenrolled course certificate', () => {
    expect(completionEligible(['a', 'b'], ['a', 'b'], true)).toBe(true);
    expect(completionEligible([], [], true)).toBe(false);
    expect(completionEligible(['a', 'b'], ['a'], true)).toBe(false);
    expect(completionEligible(['a'], ['a'], false)).toBe(false);
  });
});

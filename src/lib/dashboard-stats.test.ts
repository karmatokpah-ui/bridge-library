import {describe,it,expect} from 'vitest';
import {courseProgress,averageScore} from './dashboard-stats';
describe('dashboard real progress',()=>{
 it('counts only completed lessons belonging to the course',()=>expect(courseProgress(['a','b','c','d'],['a','b','unrelated'])).toBe(50));
 it('does not award completion to an empty course',()=>expect(courseProgress([],['a'])).toBe(0));
 it('averages percentages of scored attempts only',()=>expect(averageScore([{score:8,total_questions:10},{score:3,total_questions:5},{score:0,total_questions:0}])).toBe(70));
 it('has no score before a scored attempt',()=>expect(averageScore([])).toBeNull());
});
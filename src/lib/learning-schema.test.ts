import { describe, expect, it } from 'vitest';
import { roleSchema, assignmentSchema, submissionSchema, scoreWithinMaximum } from './learning-schema';
describe('Learning permissions and validation',()=>{
  it('allows only student, teacher, school admin, or admin roles',()=>{expect(roleSchema.options).toEqual(['student','teacher','school_admin','admin']);expect(roleSchema.safeParse('owner').success).toBe(false);});
  it('requires work before a submission can be saved',()=>{expect(submissionSchema.safeParse({assignment_id:'12345678-1234-4234-8234-123456789abc',work:'  '}).success).toBe(false);});
  it('requires a positive assignment maximum',()=>{expect(assignmentSchema.safeParse({class_id:'12345678-1234-4234-8234-123456789abc',title:'Reading',instructions:'Read chapter one',max_score:0,due_at:null}).success).toBe(false);});
  it('allows scores from zero through the assignment maximum',()=>{expect(scoreWithinMaximum(0,100)).toBe(true);expect(scoreWithinMaximum(100,100)).toBe(true);expect(scoreWithinMaximum(101,100)).toBe(false);expect(scoreWithinMaximum(-1,100)).toBe(false);});
});
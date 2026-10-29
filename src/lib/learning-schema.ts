import { z } from "zod";

export const roleSchema = z.enum(["student", "teacher", "school_admin", "admin"]);
export const assignmentSchema = z.object({
  class_id: z.string().uuid(), title: z.string().trim().min(1).max(200),
  instructions: z.string().trim().min(1).max(50000), max_score: z.coerce.number().int().min(1).max(10000),
  due_at: z.string().datetime().nullable(),
});
export const submissionSchema = z.object({ assignment_id: z.string().uuid(), work: z.string().trim().min(1).max(50000) });
export const gradeSchema = z.object({ id: z.string().uuid(), score: z.coerce.number().int().min(0), feedback: z.string().trim().max(10000) });
export const classSchema = z.object({ name: z.string().trim().min(1).max(180), education_level: z.enum(["primary", "junior_high", "senior_high", "college_vocational", "other"]), grade_level: z.string().trim().min(1).max(80), academic_year: z.coerce.number().int().min(2020).max(2100), subject_id: z.coerce.number().int().positive().nullable() });
export function scoreWithinMaximum(score: number, maximum: number) { return Number.isInteger(score) && score >= 0 && score <= maximum; }
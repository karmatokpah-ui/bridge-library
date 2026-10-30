import { z } from 'zod';
const questionSchema=z.object({id:z.string().uuid(),prompt:z.string().trim().min(1),options:z.array(z.object({id:z.string().min(1),text:z.string().trim().min(1)})).min(2).refine(o=>new Set(o.map(x=>x.id)).size===o.length),explanation:z.string().nullable(),exam_type:z.string().nullable()});
export function publishedPracticeQuestions(rows:unknown[]) {
  return rows.flatMap(row=>{const result=questionSchema.safeParse(row);return result.success?[result.data]:[];});
}
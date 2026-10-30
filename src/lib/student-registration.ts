import { z } from 'zod';
export const studentRegistrationSchema = z.object({
  fullName:z.string().trim().min(2,'Enter your full name.').max(120),
  email:z.email('Enter a valid email address.'),
  password:z.string().min(8,'Use a password with at least 8 characters.'),
  phone:z.string().trim().regex(/^\+?[0-9 ()-]{7,25}$/,'Enter a phone number including your country code.').refine(v=>v.replace(/\D/g,'').length>=7&&v.replace(/\D/g,'').length<=15,'Enter a valid phone number.'),
  school:z.string().trim().min(2,'Enter the school you attend.').max(200),
  learnerPath:z.enum(['school_learner','wassce_candidate','independent_learner']),
  educationLevel:z.enum(['primary','junior_high','senior_high','college_vocational','other']),
  gradeLevel:z.string().trim().max(80),
  targetExamYear:z.number().int().min(2020).max(2100).nullable(),
});
export function validateStudentPhoto(file:{type:string;size:number}) {
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Choose a JPG, PNG or WebP photo.');
  if(file.size<=0||file.size>5*1024*1024) throw new Error('Choose a photo smaller than 5 MB.');
}
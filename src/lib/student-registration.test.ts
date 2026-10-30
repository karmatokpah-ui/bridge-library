import { describe,it,expect } from 'vitest';
import {studentRegistrationSchema,validateStudentPhoto} from './student-registration';
const details={fullName:'Student Example',email:'student@example.org',password:'eightchars',phone:'+231 770 123 456',school:'Example School',learnerPath:'school_learner',educationLevel:'senior_high',gradeLevel:'12',targetExamYear:2027};
describe('student self-registration',()=>{
 it('requires a real-format email address',()=>expect(studentRegistrationSchema.safeParse({...details,email:'not-email'}).success).toBe(false));
 it('requires a phone number',()=>expect(studentRegistrationSchema.safeParse({...details,phone:''}).success).toBe(false));
 it('requires the school attended',()=>expect(studentRegistrationSchema.safeParse({...details,school:''}).success).toBe(false));
 it('accepts complete student details without asserting identity verification',()=>expect(studentRegistrationSchema.safeParse(details).success).toBe(true));
 it('rejects non-image photo uploads',()=>expect(()=>validateStudentPhoto({type:'text/html',size:20})).toThrow());
 it('limits photo size to 5 MB',()=>expect(()=>validateStudentPhoto({type:'image/jpeg',size:5*1024*1024+1})).toThrow());
});
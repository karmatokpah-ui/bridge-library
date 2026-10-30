import {describe,it,expect} from 'vitest';
import {certificateTotal,missingExamDates,missingStudentVerification} from './dashboard-records';
describe('reliable dashboard records',()=>{
 it('shows zero only after a successful count of issued certificates',()=>expect(certificateTotal(0,null)).toEqual({status:'available',value:0}));
 it('uses the issued certificate count instead of course completions',()=>expect(certificateTotal(3,null)).toEqual({status:'available',value:3}));
 it('never represents failed certificate reads as zero',()=>expect(certificateTotal(0,{code:'42501'}).status).toBe('unavailable'));
 it('does not represent a missing count as zero',()=>expect(certificateTotal(null,null).status).toBe('unavailable'));
 it('does not treat a target year as a verified exam date',()=>expect(missingExamDates.status).toBe('unavailable'));
 it('does not infer student verification from a role or email',()=>expect(missingStudentVerification.status).toBe('unavailable'));
});
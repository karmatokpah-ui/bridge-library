import {createServerFn} from '@tanstack/react-start';
import {requireBridgeAuth} from './bridge-auth';
import {certificateTotal,missingExamDates,missingStudentVerification} from './dashboard-records';

// Only the original backend's issued, owner-scoped certificates are a confirmed
// record source. Do not infer schedules from exam papers or identity from metadata.
export const dashboardRecords = createServerFn({method:'POST'}).middleware([requireBridgeAuth]).handler(async ({context})=>{
 const issued=await context.supabase.from('bridge_certificates').select('id',{count:'exact',head:true}).eq('user_id',context.userId);
 return {certificates:certificateTotal(issued.count,issued.error),examDates:missingExamDates,verification:missingStudentVerification};
});
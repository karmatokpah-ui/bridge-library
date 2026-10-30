import {createServerFn} from '@tanstack/react-start';
import {requireBridgeAuth} from './bridge-auth';
export const practiceMaterials=createServerFn({method:'POST'}).middleware([requireBridgeAuth]).handler(async({context:{supabase}})=>{
 const [subjects,notes,papers]=await Promise.all([
  supabase.from('subjects').select('id,name').order('name'),
  supabase.from('lessons').select('id,subject_id,title,summary,content').eq('is_published',true).order('created_at'),
  supabase.from('exam_papers').select('id,subject_id,title,examination,exam_year').eq('is_published',true).order('exam_year',{ascending:false}),
 ]);
 return {subjects:subjects.data??[],notes:notes.error?null:notes.data??[],papers:papers.error?null:papers.data??[]};
});
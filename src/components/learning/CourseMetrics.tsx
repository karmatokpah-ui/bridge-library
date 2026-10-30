import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { BookOpen, Star, Users } from 'lucide-react';
import { catalogueMetrics } from '@/lib/reference.functions';
export function useCourseMetrics() { const fetch=useServerFn(catalogueMetrics);return useQuery({queryKey:['course-metrics'],queryFn:()=>fetch(),staleTime:60000}); }
export function CourseMetrics({ subjectId, lessonsOnly = false }: {subjectId:number;lessonsOnly?:boolean}) {
 const q=useCourseMetrics();const m=q.data?.metrics.find(x=>Number(x.subject_id)===subjectId);
 if(lessonsOnly) return <span className="bl-course-lesson-badge"><BookOpen size={13}/>{m ? m.lesson_count : '—'} Lessons</span>;
 return <div className="bl-course-metrics"><span title={m?'Enrolled learners':'Counts unavailable until the data connection is restored'}><Users size={14}/>{m?Number(m.student_count).toLocaleString():'—'} Students</span><span><Star size={15}/>{m?.rating_average ?? '—'} ({m?.rating_count ?? '—'})</span></div>;
}

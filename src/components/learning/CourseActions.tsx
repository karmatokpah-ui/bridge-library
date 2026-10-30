import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { useQuery } from '@tanstack/react-query';
import { Bookmark, Star } from 'lucide-react';
import { savedCourses, bookmarkCourse, rateCourse } from '@/lib/reference.functions';
import { Button } from '@/components/ui/button';
export function CourseActions({subjectId,enrolled}:{subjectId:number;enrolled:boolean}) {
 const load=useServerFn(savedCourses);const save=useServerFn(bookmarkCourse);const rate=useServerFn(rateCourse);
 const q=useQuery({queryKey:['bookmarks'],queryFn:()=>load(),retry:false});const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);const [rating,setRating]=useState(0);
 const bookmarked=q.data?.some(b=>b.subject_id===subjectId)??false;
 return <div className="bl-course-actions"><Button variant="outline" disabled={busy} aria-pressed={bookmarked} onClick={async()=>{setBusy(true);try{await save({data:{subject_id:subjectId,saved:!bookmarked}});await q.refetch();setMessage(bookmarked?'Bookmark removed.':'Course bookmarked.');}catch(e){setMessage(e instanceof Error?e.message:'Could not save bookmark.');}finally{setBusy(false);}}}><Bookmark size={16}/>{bookmarked?'Bookmarked':'Bookmark'}</Button><fieldset className="bl-stars" disabled={!enrolled||busy}><legend>Rate this course</legend>{[1,2,3,4,5].map(n=><Button key={n} variant="outline" aria-label={`Rate ${n} ${n===1?'star':'stars'}`} aria-pressed={rating===n} title={enrolled?`${n} stars`:'Enroll before rating'} onClick={async()=>{setBusy(true);try{await rate({data:{subject_id:subjectId,rating:n}});setRating(n);setMessage('Rating saved.');}catch(e){setMessage(e instanceof Error?e.message:'Could not save rating.');}finally{setBusy(false);}}}><Star size={18} fill={n<=rating?'currentColor':'none'}/></Button>)}</fieldset>{message&&<p role="status">{message}</p>}</div>;
}

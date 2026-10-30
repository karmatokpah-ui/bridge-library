import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, BookOpen, CheckCircle2, ClipboardCheck } from 'lucide-react';
import { LearnerShell } from './LearnerPages';
import { EmptyState, SubjectIcon } from '@/components/site/SiteChrome';
import { Button } from '@/components/ui/button';
import { studySteps } from '@/lib/study-steps.functions';
import { courseData, learningAction } from '@/lib/learning.functions';

function StudyError({error,retry}:{error:unknown;retry:()=>void}) {
  const text=error instanceof Error?error.message:'Study records unavailable.';
  const signedOut=/sign in|session/i.test(text);
  return <EmptyState title={signedOut?'Sign in to continue studying':'Study records unavailable'} text={text} action={signedOut?<Link to="/" search={{auth:'login'}} className="bl-btn bl-btn-primary">Sign in <ArrowRight size={16}/></Link>:<Button variant="outline" onClick={retry}>Try again</Button>}/>;
}

export function StudyStepsPage() {
  const load=useServerFn(studySteps);
  const q=useQuery({queryKey:['study-steps'],queryFn:()=>load(),retry:false});
  return <LearnerShell active="study-guide">
    <nav className="bl-study-step-nav"><Link to="/dashboard">Dashboard</Link><span>/</span><Link to="/study-guide">Study Guide</Link><span>/</span><span>Study steps</span></nav>
    <div className="bl-study-step-heading"><div><h1>My Study Steps</h1><p className="bl-muted">Continue your enrolled courses</p></div><Link to="/study-guide" className="bl-btn bl-btn-outline">Ask Study Guide <ArrowRight size={16}/></Link></div>
    {q.isPending?<p role="status">Loading your study steps…</p>:q.error?<StudyError error={q.error} retry={()=>void q.refetch()}/>:!q.data?.length?<EmptyState title="No enrolled courses yet" text="Choose a subject to begin studying." action={<Link to="/courses" className="bl-btn bl-btn-primary">Browse courses <ArrowRight size={16}/></Link>}/>:<div className="bl-study-step-courses">{q.data.map(c=><section key={c.subject.id} className="bl-study-step-course">
      <div className="bl-study-step-heading"><div className="bl-study-step-subject"><SubjectIcon name={c.subject.name}/><div><h2>{c.subject.name}</h2><p className="bl-muted">{c.total?`${c.progress}% complete · ${c.total} published lessons`:'No published lessons yet'}</p></div></div><Link to="/courses/$subjectId" params={{subjectId:String(c.subject.id)}} className="bl-link">View course <ArrowRight size={14}/></Link></div>
      <progress className="bl-sd-meter" value={c.progress} max={100} aria-label={`${c.subject.name} progress`}/>
      <div className="bl-study-step-list">{c.nextLessons.map((l,i)=><article key={l.id} className="bl-study-step-item"><span className="bl-study-step-number">{i+1}</span><div><h3>{l.title}</h3>{l.summary&&<p className="bl-muted">{l.summary}</p>}<Link to="/study-guide/lessons/$subjectId/$lessonId" params={{subjectId:String(c.subject.id),lessonId:l.id}} className="bl-link"><BookOpen size={15}/>Study lesson <ArrowRight size={14}/></Link></div></article>)}</div>
      {!c.nextLessons.length&&<p className="bl-muted">{c.total?'All published lessons completed. Practise this subject or revisit a lesson.':'Study steps will appear when lessons are published.'}</p>}
      <Link to="/practice" search={{subject:String(c.subject.id)}} className="bl-btn bl-btn-outline"><ClipboardCheck size={16}/>Practice {c.subject.name} <ArrowRight size={14}/></Link>
    </section>)}</div>}
  </LearnerShell>;
}

export function StudyLessonPage({subjectId,lessonId}:{subjectId:string;lessonId:string}) {
  const load=useServerFn(courseData);const save=useServerFn(learningAction);const cache=useQueryClient();
  const q=useQuery({queryKey:['course',subjectId],queryFn:()=>load({data:Number(subjectId)}),retry:false});
  const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
  const d=q.data;const lesson=d?.lessons.find(l=>l.id===lessonId);const complete=d?.completions.some(c=>c.lesson_id===lessonId);
  const index=d?.lessons.findIndex(l=>l.id===lessonId)??-1;
  const next=d?.lessons.slice(index+1).find(l=>!d.completions.some(c=>c.lesson_id===l.id));
  return <LearnerShell active="study-guide"><nav className="bl-study-step-nav"><Link to="/dashboard">Dashboard</Link><span>/</span><Link to="/study-guide/steps">Study steps</Link></nav>
    {q.isPending?<p role="status">Loading lesson…</p>:q.error?<StudyError error={q.error} retry={()=>void q.refetch()}/>:!lesson?<EmptyState title="Lesson unavailable" text="This lesson is not currently published in this course." action={<Link to="/study-guide/steps" className="bl-btn bl-btn-primary">Back to study steps</Link>}/>:<>
      <div className="bl-study-step-heading"><div><p className="bl-muted">{d?.subject.name}</p><h1>{lesson.title}</h1></div>{complete&&<span className="bl-study-step-completed"><CheckCircle2 size={18}/>Completed</span>}</div>
      {lesson.summary&&<p className="bl-muted">{lesson.summary}</p>}
      <article className="bl-study-lesson-content bl-prewrap">{lesson.content||'Lesson content is not yet available.'}</article>
      {message&&<p role="status" className="bl-notice">{message}</p>}
      <div className="bl-study-step-controls"><Button disabled={busy||complete||!lesson.content||!d?.enrolled} onClick={async()=>{setBusy(true);setMessage('');try{await save({data:{kind:'complete',lesson_id:lesson.id}});await Promise.all([cache.invalidateQueries({queryKey:['course',subjectId]}),cache.invalidateQueries({queryKey:['study-steps']}),cache.invalidateQueries({queryKey:['workspace']}),cache.invalidateQueries({queryKey:['dashboard-courses']})]);setMessage('Lesson completed. Your progress is updated.');}catch(e){setMessage(e instanceof Error?e.message:'Could not save your progress.');}finally{setBusy(false);}}}><CheckCircle2 size={16}/>{complete?'Completed':busy?'Saving…':'Mark lesson complete'}</Button>
      {next?<Link to="/study-guide/lessons/$subjectId/$lessonId" params={{subjectId,lessonId:next.id}} className="bl-btn bl-btn-outline">Next lesson <ArrowRight size={16}/></Link>:<Link to="/practice" search={{subject:subjectId}} className="bl-btn bl-btn-outline">Practice this subject <ArrowRight size={16}/></Link>}
      <Link to="/study-guide/steps" className="bl-link">Back to study steps</Link></div>
      {!d?.enrolled&&<Link to="/courses/$subjectId" params={{subjectId}} className="bl-link">Enroll in this course to save lesson progress <ArrowRight size={14}/></Link>}
    </>}
  </LearnerShell>;
}
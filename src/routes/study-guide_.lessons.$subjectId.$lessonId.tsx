import { createFileRoute } from '@tanstack/react-router';
import { StudyLessonPage } from '@/components/learning/StudySteps';
export const Route=createFileRoute('/study-guide_/lessons/$subjectId/$lessonId')({
  head:()=>({meta:[{title:'Study Guide Lesson — BridgeLIB'},{name:'description',content:'Read your recommended course lesson and save completion to your learning progress.'},{property:'og:title',content:'Study Guide Lesson — BridgeLIB'},{property:'og:description',content:'Study a published lesson, continue learning and practise your subject.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'},{name:'robots',content:'noindex'}]}),
  component:LessonRoute,
});
function LessonRoute(){const {subjectId,lessonId}=Route.useParams();return <StudyLessonPage key={`${subjectId}:${lessonId}`} subjectId={subjectId} lessonId={lessonId}/>;}
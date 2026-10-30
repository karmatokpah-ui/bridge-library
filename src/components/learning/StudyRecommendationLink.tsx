import type { ComponentProps } from 'react';
import { Link } from '@tanstack/react-router';
import { resolveStudyDestination } from '@/lib/study-destinations';

export function StudyRecommendationLink({href,children}:ComponentProps<'a'>) {
  const destination=resolveStudyDestination(href??'');
  if (!destination) return <span>{children}</span>;
  if (destination.kind==='course') return <Link to="/courses/$subjectId" params={{subjectId:destination.subjectId}} className="bl-link">{children}</Link>;
  if (destination.kind==='lesson') return <Link to="/study-guide/lessons/$subjectId/$lessonId" params={{subjectId:destination.subjectId,lessonId:destination.lessonId}} className="bl-link">{children}</Link>;
  if (destination.kind==='practice') return <Link to="/practice" search={{subject:destination.subject}} className="bl-link">{children}</Link>;
  return <Link to={destination.to} className="bl-link">{children}</Link>;
}
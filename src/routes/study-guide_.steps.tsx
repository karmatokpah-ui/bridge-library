import { createFileRoute } from '@tanstack/react-router';
import { StudyStepsPage } from '@/components/learning/StudySteps';
export const Route=createFileRoute('/study-guide_/steps')({
  head:()=>({meta:[{title:'My Study Steps — BridgeLIB'},{name:'description',content:'Follow your study recommendations with published lessons and subject practice.'},{property:'og:title',content:'My Study Steps — BridgeLIB'},{property:'og:description',content:'Continue your enrolled courses and follow your next study steps.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'},{name:'robots',content:'noindex'}]}),
  component:StudyStepsPage,
});
import { createFileRoute } from '@tanstack/react-router';
import { MyCoursesPage } from '@/components/learning/LearnerPages';
export const Route = createFileRoute('/my-courses')({
 head: () => ({ meta: [{ title: 'My Courses — BridgeLIB' }, { name: 'description', content: 'Continue your enrolled BridgeLIB courses.' }, { property: 'og:title', content: 'My Courses — BridgeLIB' }, { property: 'og:description', content: 'Continue your enrolled BridgeLIB courses.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
 component: MyCoursesPage,
});

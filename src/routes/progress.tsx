import { createFileRoute } from '@tanstack/react-router';
import { ProgressPage } from '@/components/learning/LearnerPages';
export const Route = createFileRoute('/progress')({
 head: () => ({ meta: [{ title: 'My Progress — BridgeLIB' }, { name: 'description', content: 'Review your completed lessons and practice scores.' }, { property: 'og:title', content: 'My Progress — BridgeLIB' }, { property: 'og:description', content: 'Review your completed lessons and practice scores.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
 component: ProgressPage,
});

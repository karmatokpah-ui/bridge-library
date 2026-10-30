import { createFileRoute } from '@tanstack/react-router';
import { ProfilePage } from '@/components/learning/LearnerPages';
export const Route = createFileRoute('/profile')({
 head: () => ({ meta: [{ title: 'Profile — BridgeLIB' }, { name: 'description', content: 'Manage your BridgeLIB learner profile.' }, { property: 'og:title', content: 'Profile — BridgeLIB' }, { property: 'og:description', content: 'Manage your BridgeLIB learner profile.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
 component: ProfilePage,
});

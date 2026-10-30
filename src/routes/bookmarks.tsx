import { createFileRoute } from '@tanstack/react-router';
import { BookmarksPage } from '@/components/learning/LearnerPages';
export const Route = createFileRoute('/bookmarks')({
 head: () => ({ meta: [{ title: 'Bookmarks — BridgeLIB' }, { name: 'description', content: 'Return to your saved BridgeLIB courses.' }, { property: 'og:title', content: 'Bookmarks — BridgeLIB' }, { property: 'og:description', content: 'Return to your saved BridgeLIB courses.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
 component: BookmarksPage,
});

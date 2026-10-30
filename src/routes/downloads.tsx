import { createFileRoute } from '@tanstack/react-router';
import { DownloadsPage } from '@/components/learning/LearnerPages';
export const Route = createFileRoute('/downloads')({
 head: () => ({ meta: [{ title: 'Downloads — BridgeLIB' }, { name: 'description', content: 'Download published BridgeLIB exam papers.' }, { property: 'og:title', content: 'Downloads — BridgeLIB' }, { property: 'og:description', content: 'Download published BridgeLIB exam papers.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
 component: DownloadsPage,
});

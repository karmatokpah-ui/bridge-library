import { createFileRoute } from '@tanstack/react-router';
import { CertificatesPage } from '@/components/learning/LearnerPages';
export const Route = createFileRoute('/certificates')({
 head: () => ({ meta: [{ title: 'My Certificates — BridgeLIB' }, { name: 'description', content: 'View and print your BridgeLIB course completion certificates.' }, { property: 'og:title', content: 'My Certificates — BridgeLIB' }, { property: 'og:description', content: 'View and print your BridgeLIB course completion certificates.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
 component: CertificatesPage,
});

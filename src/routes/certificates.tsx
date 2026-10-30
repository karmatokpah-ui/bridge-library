import { createFileRoute } from '@tanstack/react-router';
import { CertificatesPage } from '@/components/learning/LearnerPages';
export const Route = createFileRoute('/certificates')({
 head: () => ({ meta: [{ title: 'My Certificates — BridgeLIB Liberia' }, { name: 'description', content: 'View issued BridgeLIB course completion records and download certificate PDFs.' }, { property: 'og:title', content: 'My Certificates — BridgeLIB Liberia' }, { property: 'og:description', content: 'Download your issued BridgeLIB course completion certificates.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
 component: CertificatesPage,
});

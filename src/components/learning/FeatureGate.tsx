import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useRouterState, Link } from '@tanstack/react-router';
import { publicCatalogue } from '@/lib/learning.functions';
export function FeatureGate({children}:{children:ReactNode}){
  const pathname=useRouterState({select:s=>s.location.pathname});const fetchData=useServerFn(publicCatalogue);const q=useQuery({queryKey:['catalogue'],queryFn:()=>fetchData(),staleTime:30000});
  const key=pathname.startsWith('/courses')?'courses':pathname==='/practice'?'practice':pathname==='/teacher'?'teacher':null;
  const feature=q.data?.features.find(f=>f.key===key);
  return feature?.enabled===false?<main className="bl-container bl-section"><h1 className="bl-page-title">{feature.label} is currently unavailable</h1><Link to="/" className="bl-link">Back to BridgeLIB</Link></main>:<>{children}</>;
}
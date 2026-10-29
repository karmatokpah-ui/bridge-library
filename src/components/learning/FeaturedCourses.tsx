import {useQuery} from '@tanstack/react-query';
import {useServerFn} from '@tanstack/react-start';
import {Link} from '@tanstack/react-router';
import {ArrowRight} from 'lucide-react';
import {publicCatalogue} from '@/lib/learning.functions';
import {SubjectIcon} from '@/components/site/SiteChrome';
export function FeaturedCourses(){const fetchData=useServerFn(publicCatalogue);const q=useQuery({queryKey:['catalogue'],queryFn:()=>fetchData(),staleTime:30000});return <section className="bl-container bl-section"><div className="bl-featured"><div className="bl-featured-head"><div><h2 className="bl-h2">Featured Courses &amp; Learning Resources</h2><p className="bl-muted">Access quality courses, past questions, and study materials tailored for Liberian students.</p></div><Link to="/courses" className="bl-link">View All Courses <ArrowRight size={16}/></Link></div><div className="bl-grid-3">{q.data?.subjects.slice(0,6).map(s=><div key={s.id} className="bl-card bl-course"><SubjectIcon name={s.name}/><h3>{s.name}</h3><p>{s.description}</p><Link to="/courses/$subjectId" params={{subjectId:String(s.id)}} className="bl-btn bl-btn-primary bl-btn-sm">Start Course <ArrowRight size={16}/></Link></div>)}</div>{q.data?.subjects.length===0&&<p className="bl-muted">Courses will appear as subjects are added.</p>}</div></section>}

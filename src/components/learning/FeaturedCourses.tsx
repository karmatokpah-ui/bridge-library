import {useQuery} from '@tanstack/react-query';
import {useServerFn} from '@tanstack/react-start';
import {Link} from '@tanstack/react-router';
import {publicCatalogue} from '@/lib/learning.functions';
import {SubjectIcon} from '@/components/site/SiteChrome';
export function FeaturedCourses(){const fetchData=useServerFn(publicCatalogue);const q=useQuery({queryKey:['catalogue'],queryFn:()=>fetchData(),staleTime:30000});return <section className="bl-container bl-section"><h2 className="bl-h2">Explore courses</h2><div className="bl-grid-3">{q.data?.subjects.slice(0,6).map(s=><Link to="/courses/$subjectId" params={{subjectId:String(s.id)}} key={s.id} className="bl-card bl-course"><SubjectIcon name={s.name}/><h3>{s.name}</h3><p>{s.description}</p><span className="bl-link">View course</span></Link>)}</div>{q.data?.subjects.length===0&&<p className="bl-muted">Courses will appear as subjects are added.</p>}</section>}
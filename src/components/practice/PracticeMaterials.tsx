import {useState} from 'react';
import {Link} from '@tanstack/react-router';
import {useServerFn} from '@tanstack/react-start';
import {useQuery} from '@tanstack/react-query';
import {ArrowRight,BookOpen,FileText} from 'lucide-react';
import {LearnerShell} from '@/components/learning/LearnerPages';
import {Button} from '@/components/ui/button';
import {practiceMaterials} from '@/lib/practice-materials.functions';
import {paperDownload} from '@/lib/learning.functions';
import {liberianRevision} from '@/lib/liberian-revision';
export function PracticeMaterials({kind,subject}:{kind:'notes'|'papers';subject?:string}){
 const load=useServerFn(practiceMaterials);const download=useServerFn(paperDownload);
 const q=useQuery({queryKey:['practice-materials'],queryFn:()=>load(),retry:false});
 const [filter,setFilter]=useState(subject??'');const [search,setSearch]=useState('');const [selected,setSelected]=useState('');const [message,setMessage]=useState('');const [busy,setBusy]=useState<number|null>(null);
 const notes=q.data?.notes?.filter(n=>(!filter||String(n.subject_id)===filter)&&`${n.title} ${n.summary}`.toLowerCase().includes(search.toLowerCase()));
 const papers=q.data?.papers?.filter(n=>(!filter||String(n.subject_id)===filter)&&`${n.title} ${n.examination} ${n.exam_year}`.toLowerCase().includes(search.toLowerCase()));
 const title=kind==='notes'?'Study Notes':'Past Questions';
 const originals=liberianRevision.filter(n=>!search||`${n.subject} ${n.title} ${n.content}`.toLowerCase().includes(search.toLowerCase()));
 return <LearnerShell active="practice"><nav className="bl-study-step-nav"><Link to="/practice">Practice</Link><span>/</span><span>{title}</span></nav><h1>{title}</h1>
 <div className="bl-material-filters"><input type="search" className="bl-search" aria-label={`Search ${title.toLowerCase()}`} placeholder={`Search ${title.toLowerCase()}…`} value={search} onChange={e=>setSearch(e.target.value)}/><select aria-label="Filter material subject" value={filter} onChange={e=>setFilter(e.target.value)}><option value="">All subjects</option>{q.data?.subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
 <section className="bl-study-step-course"><h2>{kind==='notes'?'Published course notes':'Published exam papers'}</h2>
 {q.isPending?<p role="status">Loading materials…</p>:q.error?<p role="status">Sign in to access published school materials. <Link to="/" search={{auth:'login'}} className="bl-link">Sign in</Link></p>:(kind==='notes'?q.data?.notes:q.data?.papers)===null?<p role="status">Published materials are unavailable. No official materials have been substituted.</p>:<>
 {kind==='notes'?notes?.map(n=><article key={n.id} className="bl-study-step-item"><BookOpen size={20}/><div><h3>{n.title}</h3><p className="bl-muted">{q.data?.subjects.find(s=>s.id===n.subject_id)?.name}</p><Button variant="outline" onClick={()=>setSelected(selected===n.id?'':n.id)}>{selected===n.id?'Close notes':'Read notes'}</Button>{selected===n.id&&<div className="bl-prewrap bl-study-lesson-content">{n.content||'These notes have no published content yet.'}</div>}</div></article>):papers?.map(p=><article key={p.id} className="bl-study-step-item"><FileText size={20}/><div><h3>{p.title}</h3><p className="bl-muted">{p.examination} · {p.exam_year} · {q.data?.subjects.find(s=>s.id===p.subject_id)?.name}</p><Button variant="outline" disabled={busy===p.id} onClick={async()=>{setBusy(p.id);setMessage('');try{const url=await download({data:p.id});window.location.assign(url);}catch{setMessage('This paper could not be opened. Please try again.');}finally{setBusy(null);}}}>{busy===p.id?'Opening…':'Read / download paper'} <ArrowRight size={15}/></Button></div></article>)}
 {!(kind==='notes'?notes?.length:papers?.length)&&<p role="status">No published {kind==='notes'?'notes':'exam papers'} match this selection.</p>}
 </>}{message&&<p role="alert">{message}</p>}</section>
 <section className="bl-study-step-course"><h2>Original BridgeLIB {kind==='notes'?'revision notes':'revision questions'}</h2><p className="bl-muted">Created for Liberian learners. Not official WASSCE or school past papers.</p>
 {originals.map(n=><article className="bl-study-step-item" key={n.id}><BookOpen size={20}/><div><h3>{n.title}</h3><p className="bl-muted">{n.subject} · Original revision material</p>{kind==='notes'?<details><summary>Read revision notes</summary><div className="bl-prewrap bl-study-lesson-content">{n.content}</div></details>:n.exercises.map(e=><div className="bl-material-exercise" key={e.prompt}><p>{e.prompt}</p><details><summary>Review answer</summary><p>{e.answer}</p></details></div>)}</div></article>)}
 {!originals.length&&<p>No original revision materials match your search.</p>}</section></LearnerShell>;
}
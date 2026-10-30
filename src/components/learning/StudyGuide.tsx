import {useEffect,useMemo,useRef,useState} from 'react';
import {Link,useNavigate} from '@tanstack/react-router';
import {useServerFn} from '@tanstack/react-start';
import {useQuery,useQueryClient} from '@tanstack/react-query';
import {useChat} from '@ai-sdk/react';
import {DefaultChatTransport,type UIMessage} from 'ai';
import {Plus,ArrowRight} from 'lucide-react';
import {studyThreads,createStudyThread,studyHistory} from '@/lib/study-chat.functions';
import {supabase} from '@/lib/supabase';
import {LearnerShell} from './LearnerPages';
import {Button} from '@/components/ui/button';
import {Conversation,ConversationContent,ConversationScrollButton} from '@/components/ai-elements/conversation';
import {Message,MessageContent,MessageResponse} from '@/components/ai-elements/message';
import {PromptInput,PromptInputTextarea,PromptInputFooter,PromptInputSubmit} from '@/components/ai-elements/prompt-input';
import {Shimmer} from '@/components/ai-elements/shimmer';
import shield from '@/assets/bridgelib-shield.png';
function StudyConversation({threadId,initialMessages}:{threadId:string;initialMessages:UIMessage[]}) {
 const textarea=useRef<HTMLTextAreaElement>(null);const [error,setError]=useState('');const cache=useQueryClient();
 const transport=useMemo(()=>new DefaultChatTransport({api:'/api/study-chat',body:{threadId},headers:async()=>{const {data}=await supabase.auth.getSession();return data.session?{Authorization:`Bearer ${data.session.access_token}`}:{ };},fetch:async(url,init)=>{const response=await fetch(url,init);if(!response.ok){const payload=await response.json().catch(()=>({message:'Study guidance unavailable.'}));throw new Error(payload.message??'Study guidance unavailable.');}return response;}}),[threadId]);
 const {messages,sendMessage,status,stop}=useChat({id:threadId,messages:initialMessages,transport,onError:e=>setError(e.message),onFinish:()=>{void cache.invalidateQueries({queryKey:['study-history',threadId]});}});
 const busy=status==='submitted'||status==='streaming';
 useEffect(()=>{if(!busy)textarea.current?.focus();},[busy,threadId]);
 return <div className="bl-study-conversation"><Conversation className="bl-study-transcript"><ConversationContent>{!messages.length&&<p className="bl-muted">What should you study next?</p>}{messages.map(m=><Message key={m.id} from={m.role}><MessageContent>{m.parts.map((part,i)=>part.type==='text'?<MessageResponse key={i}>{part.text}</MessageResponse>:part.type==='reasoning'?<details className="bl-study-reasoning" key={i}><summary>Study analysis</summary><MessageResponse>{part.text}</MessageResponse></details>:null)}</MessageContent></Message>)}{status==='submitted'&&<Shimmer>Reviewing your study progress…</Shimmer>}</ConversationContent><ConversationScrollButton/></Conversation>{error&&<p role="alert" className="bl-notice">{error}</p>}<PromptInput onSubmit={async({text})=>{if(busy||!text.trim())return;setError('');await sendMessage({text:text.trim()});textarea.current?.focus();}}><PromptInputTextarea ref={textarea} autoFocus aria-label="Ask about your progress" placeholder="What should I study next?" disabled={busy}/><PromptInputFooter className="justify-end"><PromptInputSubmit status={status} onStop={()=>void stop()}/></PromptInputFooter></PromptInput></div>;
}
export function StudyGuide({threadId}:{threadId?:string}) {
 const list=useServerFn(studyThreads);const create=useServerFn(createStudyThread);const history=useServerFn(studyHistory);const navigate=useNavigate();const cache=useQueryClient();
 const q=useQuery({queryKey:['study-threads'],queryFn:()=>list(),retry:false});const h=useQuery({queryKey:['study-history',threadId],queryFn:()=>history({data:threadId??''}),enabled:Boolean(threadId),retry:false});
 const [title,setTitle]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 return <LearnerShell active="study-guide"><div className="bl-study-heading"><img src={shield} alt="BridgeLIB" width={42} height={42}/><div><h1>Study Guide</h1><p>Personalized next study steps</p></div></div>{q.error?<div className="bl-study-unavailable"><h2>Study conversations unavailable</h2><p>{q.error instanceof Error?q.error.message:'Your study conversations could not be loaded.'}</p><a href="/?auth=login" className="bl-btn bl-btn-primary">Sign in <ArrowRight size={16}/></a></div>:q.isPending?<p>Loading conversations…</p>:<div className="bl-study-layout"><aside className="bl-study-threads"><form onSubmit={async e=>{e.preventDefault();if(busy)return;setBusy(true);setError('');try{const result=await create({data:title.trim()||'Study conversation'});await cache.invalidateQueries({queryKey:['study-threads']});setTitle('');await navigate({to:'/study-guide/$threadId',params:{threadId:result.id}});}catch(e){setError(e instanceof Error?e.message:'Could not save the conversation.');}finally{setBusy(false);}}}><input aria-label="Conversation title" value={title} onChange={e=>setTitle(e.target.value)} maxLength={100} placeholder="Conversation topic"/><Button disabled={busy}><Plus size={16}/>New conversation</Button></form>{q.data?.map(t=><Link key={t.id} to="/study-guide/$threadId" params={{threadId:t.id}} className={threadId===t.id?'active':''}>{t.title}</Link>)}</aside><section className="bl-study-body">{error&&<p role="alert">{error}</p>}{!threadId?<p className="bl-muted">Choose a conversation or start a new topic.</p>:h.error?<p role="alert">{h.error instanceof Error?h.error.message:'Conversation unavailable.'}</p>:h.isPending?<p>Loading your conversation…</p>:<StudyConversation key={threadId} threadId={threadId} initialMessages={JSON.parse(h.data??'[]') as UIMessage[]}/>}</section></div>}</LearnerShell>;
}
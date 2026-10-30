import { useEffect, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Bookmark, BookOpen, BarChart3, ClipboardCheck, Download, GraduationCap, House, LogOut, Settings, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { LiberiaFlag } from '@/components/site/SiteChrome';
export function StudentSidebar({ active = 'practice', verificationLabel }: { active?: string; verificationLabel?: string }) {
 const [name, setName] = useState('Guest'); const [signedIn, setSignedIn] = useState(false); const navigate = useNavigate();
 useEffect(() => { let live = true; void supabase.auth.getUser().then(async ({data}) => {
  if (!data.user || !live) return; setSignedIn(true);
  const profile = await supabase.from('profiles').select('full_name').eq('id',data.user.id).maybeSingle();
  if(live) setName(profile.data?.full_name || data.user.user_metadata['full_name'] || 'Student');
 }); return () => {live=false;}; }, []);
 return <aside className="bl-pt-side" aria-label="Student menu"><div className="bl-pt-user"><span className="bl-pt-avatar"><User size={22}/></span><div><strong>{name}</strong><span>Student</span></div></div>{verificationLabel&&<p className="bl-student-verification" role="status">{verificationLabel}</p>}<nav>
 {([
  {key:'dashboard',to:'/dashboard',label:'Dashboard',Icon:House},
  {key:'my-courses',to:'/my-courses',label:'My Courses',Icon:BookOpen},
  {key:'practice',to:'/practice',label:'Quizzes & Practice',Icon:ClipboardCheck},
  {key:'progress',to:'/progress',label:'My Progress',Icon:BarChart3},
  {key:'certificates',to:'/certificates',label:'Certificates',Icon:GraduationCap},
  {key:'bookmarks',to:'/bookmarks',label:'Bookmarks',Icon:Bookmark},
  {key:'downloads',to:'/downloads',label:'Downloads',Icon:Download},
 ] as const).map(({key,to,label,Icon})=><Link key={key} to={to} className={active===key?'is-active':''}><Icon size={18}/>{label}</Link>)}
 <hr/><Link to="/profile" className={active==='profile'?'is-active':''}><User size={18}/>Profile</Link><Link to="/settings" className={active==='settings'?'is-active':''}><Settings size={18}/>Settings</Link>
 {signedIn?<Button className="bl-side-logout" onClick={async()=>{await supabase.auth.signOut();await navigate({to:'/'});}}><LogOut size={18}/>Logout</Button>:<a href="/?auth=login"><LogOut size={18}/>Login</a>}
 </nav><div className="bl-pt-side-card"><LiberiaFlag size={80}/><strong>Learn Today, Build Tomorrow.</strong><span>Better education.<br/>A brighter Liberia.</span></div></aside>;
}

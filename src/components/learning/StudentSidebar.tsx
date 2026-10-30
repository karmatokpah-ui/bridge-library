import { useEffect, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Bookmark, BookOpen, BarChart3, ClipboardCheck, Download, GraduationCap, House, LogOut, Settings, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { LiberiaFlag } from '@/components/site/SiteChrome';
export function StudentSidebar({ active = 'practice' }: { active?: string }) {
 const [name, setName] = useState('Guest'); const [signedIn, setSignedIn] = useState(false); const navigate = useNavigate();
 useEffect(() => { let live = true; void supabase.auth.getUser().then(async ({data}) => {
  if (!data.user || !live) return; setSignedIn(true);
  const profile = await supabase.from('profiles').select('full_name').eq('id',data.user.id).maybeSingle();
  if(live) setName(profile.data?.full_name || data.user.user_metadata['full_name'] || 'Student');
 }); return () => {live=false;}; }, []);
 return <aside className="bl-pt-side" aria-label="Student menu"><div className="bl-pt-user"><span className="bl-pt-avatar"><User size={22}/></span><div><strong>{name}</strong><span>Student</span></div></div><nav>
 {[
  ['dashboard','/dashboard','Dashboard',House],['my-courses','/my-courses','My Courses',BookOpen],['practice','/practice','Quizzes & Practice',ClipboardCheck],['progress','/progress','My Progress',BarChart3],['certificates','/certificates','Certificates',GraduationCap],['bookmarks','/bookmarks','Bookmarks',Bookmark],['downloads','/downloads','Downloads',Download],
 ] .map(([key,path,label,Icon]) => { const I=Icon as typeof House; return <Link key={String(key)} to={path as '/dashboard'} className={active===key?'is-active':''}><I size={18}/>{String(label)}</Link>; })}
 <hr/><Link to="/profile" className={active==='profile'?'is-active':''}><User size={18}/>Profile</Link><Link to="/settings" className={active==='settings'?'is-active':''}><Settings size={18}/>Settings</Link>
 {signedIn?<Button className="bl-side-logout" onClick={async()=>{await supabase.auth.signOut();await navigate({to:'/'});}}><LogOut size={18}/>Logout</Button>:<a href="/?auth=login"><LogOut size={18}/>Login</a>}
 </nav><div className="bl-pt-side-card"><LiberiaFlag size={80}/><strong>Learn Today, Build Tomorrow.</strong><span>Better education.<br/>A brighter Liberia.</span></div></aside>;
}

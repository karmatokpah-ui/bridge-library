import { createMiddleware } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { createClient } from '@supabase/supabase-js';
import { BRIDGE_PUBLISHABLE_KEY, BRIDGE_SUPABASE_URL } from './supabase';

export const requireBridgeAuth = createMiddleware({type:'function'}).server(async ({next})=>{
  const header=getRequest().headers.get('authorization');
  if(!header?.startsWith('Bearer ')) throw new Error('Sign in to continue.');
  const token=header.slice(7);
  const client=createClient(BRIDGE_SUPABASE_URL,BRIDGE_PUBLISHABLE_KEY,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:`Bearer ${token}`}}});
  const {data,error}=await client.auth.getUser(token);
  if(error || !data.user) throw new Error('Your session has expired. Sign in again.');
  return next({context:{supabase:client,userId:data.user.id}});
});
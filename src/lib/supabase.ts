import { createClient } from '@supabase/supabase-js';
// Preserve the original external BridgeLIB backend regardless of editor bindings.
export const BRIDGE_SUPABASE_URL = 'https://qlwtccmvddhgdnknrgnh.supabase.co';
export const BRIDGE_PUBLISHABLE_KEY = 'sb_publishable_wKuleQ5jc2evn7g6qt7Qhw_S8UKrWOg';
export const supabase = createClient(BRIDGE_SUPABASE_URL, BRIDGE_PUBLISHABLE_KEY);

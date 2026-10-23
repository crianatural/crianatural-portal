import {createClient} from '@supabase/supabase-js';
const url=import.meta.env.VITE_SUPABASE_URL;
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const cloudMode=import.meta.env.VITE_PORTAL_MODE==='supabase' && new URLSearchParams(location.search).get('demo')!=='1';
export const supabase=url&&key?createClient(url,key):null;

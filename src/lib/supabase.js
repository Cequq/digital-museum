import { createClient } from '@supabase/supabase-js';

// Зөвхөн нийтийн (anon) түлхүүрийг ашиглана. Хамгаалалтыг өгөгдлийн сангийн RLS хийнэ.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey)
  : // Тохиргоо хийгээгүй үед апп унахгүйн тулд хоосон клиент
    createClient('https://placeholder.supabase.co', 'placeholder-key');

export const BUCKET = 'museum';

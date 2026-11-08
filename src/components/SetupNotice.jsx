import { isSupabaseConfigured } from '../lib/supabase';

export default function SetupNotice() {
  if (isSupabaseConfigured) return null;
  return (
    <div className="setup-banner" role="alert">
      <strong>Supabase тохируулаагүй байна.</strong> Төслийн үндсэн хавтаст <code>.env</code> файл
      үүсгэж <code>VITE_SUPABASE_URL</code>, <code>VITE_SUPABASE_ANON_KEY</code>-г оруулаад
      серверээ дахин асаана уу (README-г үзнэ үү).
    </div>
  );
}

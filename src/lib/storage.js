import { supabase, BUCKET } from './supabase';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function validateImage(file) {
  if (!file) return 'Файл сонгоогүй байна.';
  if (!ALLOWED.includes(file.type)) return 'Зөвхөн JPG, PNG, WEBP, GIF зураг оруулна.';
  if (file.size > MAX_SIZE) return 'Зургийн хэмжээ 5 MB-аас ихгүй байна.';
  return null;
}

/**
 * Зургийг Supabase Storage-д <userId>/<folder>/... замаар хадгалж, нийтийн URL буцаана.
 * Storage-ийн RLS бодлого хэрэглэгчийг зөвхөн өөрийн хавтас руу бичүүлнэ.
 */
export async function uploadImage(file, userId, folder = 'misc') {
  const error = validateImage(file);
  if (error) throw new Error(error);

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeName = file.name
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 40) || 'image';
  const path = `${userId}/${folder}/${Date.now()}-${safeName}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Нийтийн URL-аас Storage дахь замыг гаргаж, файлыг устгана (алдааг чимээгүй өнгөрөөнө). */
export async function removeImageByUrl(publicUrl) {
  if (!publicUrl) return;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const path = decodeURIComponent(publicUrl.slice(idx + marker.length));
  await supabase.storage.from(BUCKET).remove([path]);
}

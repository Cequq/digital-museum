// Дахин ашиглагдах Supabase select мөрүүд (JOIN-ийг foreign key-ээр хийнэ)
export const EXHIBIT_SELECT =
  '*, category:exhibition_categories(id, name), creator:profiles(id, display_name, avatar_url)';

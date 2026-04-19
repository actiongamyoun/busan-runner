// ============================================================
// Supabase 테이블 타입 정의
// ============================================================
// 실제 Supabase CLI로 생성하려면:
//   npx supabase gen types typescript --project-id YOUR_REF > src/lib/database.types.ts
// ============================================================

export type Course = {
  id: number;
  name: string;
  name_en: string | null;
  district: string | null;
  district_en: string | null;
  course_type: string | null;
  course_type_en: string | null;
  distance_km: number | null;
  duration_min: number | null;
  elevation_m: number | null;
  difficulty: string | null;
  difficulty_en: string | null;
  rating: number | null;
  review_count: number | null;
  tags: string[] | null;
  tags_en: string[] | null;
  description: string | null;
  description_en: string | null;
  image_url: string | null;
  color_primary: string | null;
  color_light: string | null;
  created_at: string;
};

export type Meet = {
  id: number;
  creator_session: string;
  title: string;
  meet_date: string; // YYYY-MM-DD
  meet_time: string; // HH:MM:SS
  course_id: number | null;
  course_name: string | null;
  spots: number;
  joined: number;
  memo: string | null;
  created_at: string;
};

export type Crew = {
  id: number;
  creator_session: string;
  host_nick: string | null;
  host_color: string | null;
  name: string;
  area: string | null;
  level: string | null;
  schedule: string | null;
  pace: string | null;
  description: string | null;
  photo_url: string | null;
  theme: string | null;
  member_limit: number;
  joined: number;
  recruit_until: string; // YYYY-MM-DD
  created_at: string;
};

export type CrewJoin = {
  id: number;
  crew_id: number;
  session_id: string;
  nickname: string | null;
  color: string | null;
  greeting: string;
  created_at: string;
};

export type MarketItem = {
  id: number;
  creator_session: string;
  seller_nick: string | null;
  seller_color: string | null;
  title: string;
  category: string;
  price: number;
  condition: string | null;
  description: string | null;
  location: string | null;
  image_url: string | null;
  status: '판매중' | '예약중' | '판매완료';
  created_at: string;
};

export type MarketComment = {
  id: number;
  item_id: number;
  session_id: string;
  author_nick: string | null;
  author_color: string | null;
  content: string;
  is_seller_reply: boolean;
  created_at: string;
};

export type Profile = {
  id: number;
  session_id: string;
  nickname: string | null;
  icon: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
};

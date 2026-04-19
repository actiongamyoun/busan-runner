-- ============================================================
-- 부산러너 (Busan Runner) - Schema Migration 001
-- 테이블 + 인덱스 + 기본 제약조건
-- ============================================================
-- 실행: Supabase Dashboard → SQL Editor → 이 파일 전체를 붙여넣고 Run
-- ============================================================

-- Extensions (Supabase는 pgcrypto, uuid-ossp가 이미 활성화됨)
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. profiles (사용자 프로필)
-- ============================================================
create table if not exists public.profiles (
  id            bigserial primary key,
  session_id    text unique not null,
  nickname      text unique,
  icon          text,
  color         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists idx_profiles_session on public.profiles(session_id);
create index if not exists idx_profiles_nickname on public.profiles(nickname);

-- 닉네임 길이/형식 제약 (2~12자, 한글/영문/숫자/_/-만)
alter table public.profiles
  drop constraint if exists profiles_nickname_format;
alter table public.profiles
  add constraint profiles_nickname_format
  check (nickname is null or (
    char_length(nickname) between 2 and 12
    and nickname ~ '^[a-zA-Z0-9가-힣_-]+$'
    and nickname not in ('익명러너', 'Anonymous')
  ));

-- ============================================================
-- 2. courses (코스 - 관리자가 미리 채움)
-- ============================================================
create table if not exists public.courses (
  id              bigserial primary key,
  name            text not null,
  name_en         text,
  district        text,
  district_en     text,
  course_type     text,     -- '해변' | '평지' | '산길'
  course_type_en  text,
  distance_km     numeric(4,1),
  duration_min    int,
  elevation_m     int,
  difficulty      text,     -- '초급' | '중급' | '고급' | '러너추천'
  difficulty_en   text,
  rating          numeric(2,1) default 0,
  review_count    int default 0,
  tags            text[],
  tags_en         text[],
  description     text,
  description_en  text,
  image_url       text,
  color_primary   text,
  color_light     text,
  created_at      timestamptz default now()
);

create index if not exists idx_courses_difficulty on public.courses(difficulty);
create index if not exists idx_courses_type on public.courses(course_type);

-- ============================================================
-- 3. course_likes (코스 좋아요)
-- ============================================================
create table if not exists public.course_likes (
  id          bigserial primary key,
  course_id   bigint references public.courses(id) on delete cascade,
  session_id  text not null,
  created_at  timestamptz default now(),
  unique(course_id, session_id)
);

create index if not exists idx_course_likes_course on public.course_likes(course_id);
create index if not exists idx_course_likes_session on public.course_likes(session_id);

-- ============================================================
-- 4. course_saves (코스 저장)
-- ============================================================
create table if not exists public.course_saves (
  id          bigserial primary key,
  course_id   bigint references public.courses(id) on delete cascade,
  session_id  text not null,
  created_at  timestamptz default now(),
  unique(course_id, session_id)
);

create index if not exists idx_course_saves_session on public.course_saves(session_id);

-- ============================================================
-- 5. course_comments (코스 댓글)
-- ============================================================
create table if not exists public.course_comments (
  id            bigserial primary key,
  course_id     bigint references public.courses(id) on delete cascade,
  session_id    text not null,
  user_name     text,
  user_color    text,
  content       text not null,
  likes_count   int default 0,
  created_at    timestamptz default now()
);

create index if not exists idx_course_comments_course on public.course_comments(course_id);

-- ============================================================
-- 6. meets (모임 - 사용자 생성, 날짜 지나면 자동 삭제)
-- ============================================================
create table if not exists public.meets (
  id              bigserial primary key,
  creator_session text not null,
  title           text default '나의 모임',
  meet_date       date not null,
  meet_time       time not null,
  course_id       bigint references public.courses(id) on delete set null,
  course_name     text,
  spots           int not null check (spots between 2 and 50),
  joined          int default 1,
  memo            text,
  created_at      timestamptz default now()
);

create index if not exists idx_meets_date on public.meets(meet_date);
create index if not exists idx_meets_creator on public.meets(creator_session);

-- ============================================================
-- 7. meet_joins (모임 참가 신청)
-- ============================================================
create table if not exists public.meet_joins (
  id          bigserial primary key,
  meet_id     bigint references public.meets(id) on delete cascade,
  session_id  text not null,
  created_at  timestamptz default now(),
  unique(meet_id, session_id)
);

create index if not exists idx_meet_joins_session on public.meet_joins(session_id);

-- ============================================================
-- 8. crews (크루 - 사용자 생성 모집방, 마감일 지나면 자동 삭제)
-- ============================================================
create table if not exists public.crews (
  id              bigserial primary key,
  creator_session text not null,
  host_nick       text,
  host_color      text,
  name            text not null,
  area            text,
  level           text,
  schedule        text,
  pace            text,
  description     text,
  photo_url       text,       -- Supabase Storage URL
  theme           text,       -- sunrise | night | river | cliff
  member_limit    int not null check (member_limit between 2 and 100),
  joined          int default 1,
  recruit_until   date not null,
  created_at      timestamptz default now()
);

create index if not exists idx_crews_recruit_until on public.crews(recruit_until);
create index if not exists idx_crews_creator on public.crews(creator_session);

-- ============================================================
-- 9. crew_joins (크루 가입 신청 - 인사말 포함)
-- ============================================================
create table if not exists public.crew_joins (
  id              bigserial primary key,
  crew_id         bigint references public.crews(id) on delete cascade,
  session_id      text not null,
  nickname        text,
  color           text,
  greeting        text not null check (char_length(greeting) >= 5),
  created_at      timestamptz default now(),
  unique(crew_id, session_id)
);

create index if not exists idx_crew_joins_crew on public.crew_joins(crew_id);
create index if not exists idx_crew_joins_session on public.crew_joins(session_id);

-- ============================================================
-- 10. market_items (장터 상품 - 30일 지나면 자동 삭제)
-- ============================================================
create table if not exists public.market_items (
  id              bigserial primary key,
  creator_session text not null,
  seller_nick     text,
  seller_color    text,
  title           text not null,
  category        text not null,  -- '러닝화' | 'GPS 워치' | '러닝웨어' | '액세서리' | '나눔/교환'
  price           int default 0 check (price >= 0),
  condition       text,
  description     text,
  location        text,
  image_url       text,
  status          text default '판매중' check (status in ('판매중', '예약중', '판매완료')),
  created_at      timestamptz default now()
);

create index if not exists idx_market_category on public.market_items(category);
create index if not exists idx_market_status on public.market_items(status);
create index if not exists idx_market_created on public.market_items(created_at);
create index if not exists idx_market_creator on public.market_items(creator_session);

-- ============================================================
-- 11. market_likes (장터 좋아요)
-- ============================================================
create table if not exists public.market_likes (
  id          bigserial primary key,
  item_id     bigint references public.market_items(id) on delete cascade,
  session_id  text not null,
  created_at  timestamptz default now(),
  unique(item_id, session_id)
);

create index if not exists idx_market_likes_item on public.market_likes(item_id);

-- ============================================================
-- 12. market_comments (장터 댓글 - 거래 문의)
-- ============================================================
create table if not exists public.market_comments (
  id              bigserial primary key,
  item_id         bigint references public.market_items(id) on delete cascade,
  session_id      text not null,
  author_nick     text,
  author_color    text,
  content         text not null,
  is_seller_reply boolean default false,
  created_at      timestamptz default now()
);

create index if not exists idx_market_comments_item on public.market_comments(item_id);

-- ============================================================
-- updated_at 자동 갱신 트리거 (profiles)
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- 완료
-- ============================================================
-- 다음 실행: 002_rls_policies.sql

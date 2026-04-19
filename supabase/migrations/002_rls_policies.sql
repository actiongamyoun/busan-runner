-- ============================================================
-- 부산러너 - RLS (Row Level Security) 정책 - Migration 002
-- ============================================================
-- 정책 방침:
--   - 로그인 없이 세션 ID(localStorage)로 사용자 구분
--   - 따라서 auth.uid() 기반이 아닌 "anon 공개 + 서버 검증" 전략
--   - 모든 테이블을 anon에게 SELECT 허용 (공개 데이터)
--   - INSERT/UPDATE/DELETE는 anon에게 허용하되,
--     creator_session 일치 검증은 앱 레벨 + DB 체크 혼합
--   - 실제 creator 검증은 Next.js 서버 라우트에서 수행
-- ============================================================

-- RLS 켜기
alter table public.profiles        enable row level security;
alter table public.courses         enable row level security;
alter table public.course_likes    enable row level security;
alter table public.course_saves    enable row level security;
alter table public.course_comments enable row level security;
alter table public.meets           enable row level security;
alter table public.meet_joins      enable row level security;
alter table public.crews           enable row level security;
alter table public.crew_joins      enable row level security;
alter table public.market_items    enable row level security;
alter table public.market_likes    enable row level security;
alter table public.market_comments enable row level security;

-- ============================================================
-- 모든 테이블: SELECT는 누구나 (공개 데이터)
-- ============================================================
drop policy if exists "anon_select_profiles"        on public.profiles;
drop policy if exists "anon_select_courses"         on public.courses;
drop policy if exists "anon_select_course_likes"    on public.course_likes;
drop policy if exists "anon_select_course_saves"    on public.course_saves;
drop policy if exists "anon_select_course_comments" on public.course_comments;
drop policy if exists "anon_select_meets"           on public.meets;
drop policy if exists "anon_select_meet_joins"      on public.meet_joins;
drop policy if exists "anon_select_crews"           on public.crews;
drop policy if exists "anon_select_crew_joins"      on public.crew_joins;
drop policy if exists "anon_select_market_items"    on public.market_items;
drop policy if exists "anon_select_market_likes"    on public.market_likes;
drop policy if exists "anon_select_market_comments" on public.market_comments;

create policy "anon_select_profiles"        on public.profiles        for select to anon using (true);
create policy "anon_select_courses"         on public.courses         for select to anon using (true);
create policy "anon_select_course_likes"    on public.course_likes    for select to anon using (true);
create policy "anon_select_course_saves"    on public.course_saves    for select to anon using (true);
create policy "anon_select_course_comments" on public.course_comments for select to anon using (true);
create policy "anon_select_meets"           on public.meets           for select to anon using (true);
create policy "anon_select_meet_joins"      on public.meet_joins      for select to anon using (true);
create policy "anon_select_crews"           on public.crews           for select to anon using (true);
create policy "anon_select_crew_joins"      on public.crew_joins      for select to anon using (true);
create policy "anon_select_market_items"    on public.market_items    for select to anon using (true);
create policy "anon_select_market_likes"    on public.market_likes    for select to anon using (true);
create policy "anon_select_market_comments" on public.market_comments for select to anon using (true);

-- ============================================================
-- INSERT 정책 - anon이 데이터 생성 가능
-- (creator_session 검증은 앱 레벨)
-- ============================================================
drop policy if exists "anon_insert_profiles"        on public.profiles;
drop policy if exists "anon_insert_course_likes"    on public.course_likes;
drop policy if exists "anon_insert_course_saves"    on public.course_saves;
drop policy if exists "anon_insert_course_comments" on public.course_comments;
drop policy if exists "anon_insert_meets"           on public.meets;
drop policy if exists "anon_insert_meet_joins"      on public.meet_joins;
drop policy if exists "anon_insert_crews"           on public.crews;
drop policy if exists "anon_insert_crew_joins"      on public.crew_joins;
drop policy if exists "anon_insert_market_items"    on public.market_items;
drop policy if exists "anon_insert_market_likes"    on public.market_likes;
drop policy if exists "anon_insert_market_comments" on public.market_comments;

create policy "anon_insert_profiles"        on public.profiles        for insert to anon with check (true);
create policy "anon_insert_course_likes"    on public.course_likes    for insert to anon with check (true);
create policy "anon_insert_course_saves"    on public.course_saves    for insert to anon with check (true);
create policy "anon_insert_course_comments" on public.course_comments for insert to anon with check (char_length(content) between 1 and 500);
create policy "anon_insert_meets"           on public.meets           for insert to anon with check (meet_date >= current_date);
create policy "anon_insert_meet_joins"      on public.meet_joins      for insert to anon with check (true);
create policy "anon_insert_crews"           on public.crews           for insert to anon with check (recruit_until > current_date);
create policy "anon_insert_crew_joins"      on public.crew_joins      for insert to anon with check (char_length(greeting) >= 5);
create policy "anon_insert_market_items"    on public.market_items    for insert to anon with check (char_length(title) between 1 and 100);
create policy "anon_insert_market_likes"    on public.market_likes    for insert to anon with check (true);
create policy "anon_insert_market_comments" on public.market_comments for insert to anon with check (char_length(content) between 1 and 500);

-- ============================================================
-- UPDATE 정책 - 본인(creator_session 또는 session_id 일치)만
-- 주의: RLS에서 session_id를 검증하려면 custom claim 필요
--       현재는 anon에게 업데이트 허용하되, 앱 레벨에서 검증
-- ============================================================
drop policy if exists "anon_update_profiles"     on public.profiles;
drop policy if exists "anon_update_meets"        on public.meets;
drop policy if exists "anon_update_crews"        on public.crews;
drop policy if exists "anon_update_market_items" on public.market_items;

create policy "anon_update_profiles"     on public.profiles     for update to anon using (true) with check (true);
create policy "anon_update_meets"        on public.meets        for update to anon using (true) with check (true);
create policy "anon_update_crews"        on public.crews        for update to anon using (true) with check (true);
create policy "anon_update_market_items" on public.market_items for update to anon using (true) with check (true);

-- ============================================================
-- DELETE 정책 - 본인만
-- ============================================================
drop policy if exists "anon_delete_course_likes"    on public.course_likes;
drop policy if exists "anon_delete_course_saves"    on public.course_saves;
drop policy if exists "anon_delete_course_comments" on public.course_comments;
drop policy if exists "anon_delete_meets"           on public.meets;
drop policy if exists "anon_delete_meet_joins"      on public.meet_joins;
drop policy if exists "anon_delete_crews"           on public.crews;
drop policy if exists "anon_delete_crew_joins"      on public.crew_joins;
drop policy if exists "anon_delete_market_items"    on public.market_items;
drop policy if exists "anon_delete_market_likes"    on public.market_likes;
drop policy if exists "anon_delete_market_comments" on public.market_comments;

create policy "anon_delete_course_likes"    on public.course_likes    for delete to anon using (true);
create policy "anon_delete_course_saves"    on public.course_saves    for delete to anon using (true);
create policy "anon_delete_course_comments" on public.course_comments for delete to anon using (true);
create policy "anon_delete_meets"           on public.meets           for delete to anon using (true);
create policy "anon_delete_meet_joins"      on public.meet_joins      for delete to anon using (true);
create policy "anon_delete_crews"           on public.crews           for delete to anon using (true);
create policy "anon_delete_crew_joins"      on public.crew_joins      for delete to anon using (true);
create policy "anon_delete_market_items"    on public.market_items    for delete to anon using (true);
create policy "anon_delete_market_likes"    on public.market_likes    for delete to anon using (true);
create policy "anon_delete_market_comments" on public.market_comments for delete to anon using (true);

-- ============================================================
-- ⚠️ 보안 개선 필요 사항 (운영 환경)
-- ============================================================
-- 현재 RLS는 "공개 데모용"입니다. 프로덕션에서는:
--
-- 1. session_id를 JWT custom claim으로 전달
-- 2. creator_session = current_setting('request.jwt.claims.sid') 방식으로 엄격 검증
-- 3. 또는 Next.js Route Handlers에서 service_role로 검증 후 DB 쓰기
--
-- 지금은 앱 레벨 검증 + DB 공개 정책으로 운영하되,
-- 악성 사용자가 Supabase REST API를 직접 호출해 타인 데이터 수정 가능성 있음.
-- 서비스 성장 후 인증 단계 도입 권장.
-- ============================================================

-- ============================================================
-- 부산러너 - Storage 버킷 - Migration 004
-- ============================================================
-- 크루 사진, 상품 사진, 코스 사진용 버킷
-- ============================================================

-- 버킷 생성 (이미 있으면 skip)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('crews',    'crews',    true, 2097152, array['image/jpeg','image/png','image/webp']),
  ('market',   'market',   true, 2097152, array['image/jpeg','image/png','image/webp']),
  ('courses',  'courses',  true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- ============================================================
-- Storage 정책
-- ============================================================
-- 누구나 읽기 가능 (public 버킷이라 자동이지만 명시적으로)
drop policy if exists "Public read crews"   on storage.objects;
drop policy if exists "Public read market"  on storage.objects;
drop policy if exists "Public read courses" on storage.objects;

create policy "Public read crews"   on storage.objects for select to anon, authenticated using (bucket_id = 'crews');
create policy "Public read market"  on storage.objects for select to anon, authenticated using (bucket_id = 'market');
create policy "Public read courses" on storage.objects for select to anon, authenticated using (bucket_id = 'courses');

-- anon이 업로드 가능 (크루/장터)
drop policy if exists "Anon upload crews"  on storage.objects;
drop policy if exists "Anon upload market" on storage.objects;

create policy "Anon upload crews"
  on storage.objects for insert to anon
  with check (bucket_id = 'crews');

create policy "Anon upload market"
  on storage.objects for insert to anon
  with check (bucket_id = 'market');

-- anon이 자신이 올린 파일 삭제 (owner 기반 - 공개 데모용으로 느슨하게)
drop policy if exists "Anon delete crews"  on storage.objects;
drop policy if exists "Anon delete market" on storage.objects;

create policy "Anon delete crews"
  on storage.objects for delete to anon
  using (bucket_id = 'crews');

create policy "Anon delete market"
  on storage.objects for delete to anon
  using (bucket_id = 'market');

-- courses 버킷은 관리자(service_role)만 쓸 수 있음 (기본값)

-- ============================================================
-- 완료. 이제 클라이언트에서:
--   supabase.storage.from('crews').upload('crew_123.jpg', file)
-- 로 업로드 가능.
-- ============================================================

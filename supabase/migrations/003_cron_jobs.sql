-- ============================================================
-- 부산러너 - 자동 삭제 cron jobs - Migration 003
-- ============================================================
-- 실행 전 확인:
--   Supabase Dashboard → Database → Extensions 에서
--   `pg_cron`을 활성화(Enable)해야 합니다.
-- ============================================================

-- pg_cron 활성화 시도 (Dashboard에서 토글하는 게 확실함)
create extension if not exists pg_cron;

-- ============================================================
-- 1. 지난 모임 자동 삭제 (매일 새벽 3시 KST = UTC 18시)
-- ============================================================
-- KST는 UTC+9 → 새벽 3시 KST = 전날 18시 UTC
select cron.schedule(
  'delete-expired-meets',
  '0 18 * * *',
  $$ delete from public.meets where meet_date < current_date $$
);

-- ============================================================
-- 2. 모집 기간 지난 크루 자동 삭제 (매일 새벽 3시 KST)
-- ============================================================
select cron.schedule(
  'delete-expired-crews',
  '0 18 * * *',
  $$ delete from public.crews where recruit_until < current_date $$
);

-- ============================================================
-- 3. 30일 이상 된 장터 상품 자동 삭제 (매일 새벽 3시 KST)
-- ============================================================
select cron.schedule(
  'delete-old-market-items',
  '0 18 * * *',
  $$ delete from public.market_items where created_at < now() - interval '30 days' $$
);

-- ============================================================
-- 설치된 cron job 확인:
--   select * from cron.job;
--
-- cron job 삭제하려면:
--   select cron.unschedule('delete-expired-meets');
-- ============================================================

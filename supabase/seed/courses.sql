-- ============================================================
-- 부산러너 - 코스 Seed 데이터
-- 실행: Supabase Dashboard → SQL Editor
-- ============================================================

insert into public.courses (
  name, name_en, district, district_en, course_type, course_type_en,
  distance_km, duration_min, elevation_m,
  difficulty, difficulty_en,
  rating, review_count,
  tags, tags_en,
  description, description_en,
  color_primary, color_light
) values
(
  '해운대 해변길', 'Haeundae Beach Trail',
  '해운대구', 'Haeundae-gu',
  '해변', 'Beach',
  4.2, 25, 12,
  '초급', 'Easy',
  4.8, 128,
  array['해변','일출','평지','초보'],
  array['Beach','Sunrise','Flat','Beginner'],
  '해운대 해수욕장을 따라 이어지는 부산 대표 러닝 코스. 평평한 지형으로 초보자에게 적합하며, 일출·일몰 시간대의 경치가 특히 아름답습니다.',
  'Busan''s signature running route along Haeundae Beach. Flat terrain perfect for beginners, with breathtaking views at sunrise and sunset.',
  '#FF9A7B', '#4A90E2'
),
(
  '광안리 → 이기대', 'Gwangalli to Igidae',
  '수영구·남구', 'Suyeong·Nam-gu',
  '해변', 'Beach',
  8.5, 55, 145,
  '중급', 'Medium',
  4.9, 94,
  array['해변','광안대교','야경','중급'],
  array['Beach','Gwangan Bridge','Night View','Medium'],
  '광안대교 야경을 배경으로 달리다 이기대의 가파른 해안 절벽까지. 난이도는 있지만 부산 최고의 경치.',
  'Run with Gwangan Bridge lit up at night, then onto the dramatic cliffs of Igidae. Challenging, but Busan''s best views.',
  '#1B3A5C', '#FF6B4A'
),
(
  '낙동강 하구 둑길', 'Nakdong Riverside',
  '사하구', 'Saha-gu',
  '평지', 'Flat',
  12, 75, 8,
  '중급', 'Medium',
  4.6, 67,
  array['강변','평지','장거리','철새'],
  array['Riverside','Flat','Long-distance','Migratory Birds'],
  '낙동강을 따라 평평하게 이어지는 장거리 코스. 조용하고 풍경이 시원하며, 겨울엔 철새도 볼 수 있습니다.',
  'A long, flat route along the Nakdong River. Quiet and scenic, with migratory birds visible in winter.',
  '#2ECC71', '#4A90E2'
),
(
  '영도 절영해안', 'Yeongdo Coast Path',
  '영도구', 'Yeongdo-gu',
  '해변', 'Beach',
  6.3, 45, 95,
  '중급', 'Medium',
  4.7, 52,
  array['해변','절벽','오션뷰','중급'],
  array['Beach','Cliffs','Ocean View','Medium'],
  '깎아지른 해안 절벽을 따라 이어지는 드라마틱한 코스. 약간의 오르막이 있지만 뷰가 압도적입니다.',
  'A dramatic route along steep coastal cliffs. Slight uphill sections, but the views are unmatched.',
  '#0F4C75', '#3282B8'
),
(
  '수영강 벚꽃길', 'Suyeong River Cherry Path',
  '해운대구', 'Haeundae-gu',
  '평지', 'Flat',
  5.8, 35, 10,
  '초급', 'Easy',
  4.8, 103,
  array['강변','벚꽃','평지','봄'],
  array['Riverside','Cherry Blossom','Flat','Spring'],
  '수영강을 따라 이어지는 벚꽃 터널. 봄철에는 꽃잎이 날리는 장관을 볼 수 있습니다.',
  'A cherry blossom tunnel along the Suyeong River. In spring, the falling petals are breathtaking.',
  '#FFB6C1', '#FF69B4'
)
on conflict do nothing;

# 🏃 부산러너 (Busan Runner)

부산의 모든 러닝 경험을 하나로 — 코스, 크루, 장터까지.

**스택:** Next.js 14 (App Router) · Supabase · Tailwind · TypeScript · Vercel

---

## 🚀 처음 시작할 때 (중요! 순서대로 진행하세요)

### 1단계: Supabase DB 준비

이미 만들어둔 Supabase 프로젝트에서 아래 작업을 진행하세요.

**1-1. 스키마 실행 (필수)**

Supabase Dashboard → 좌측 메뉴 `SQL Editor` → `+ New query` 클릭 후, 아래 파일들을 **순서대로 하나씩** 실행하세요:

```
supabase/migrations/001_schema.sql       ← 테이블 12개 생성
supabase/migrations/002_rls_policies.sql ← 접근 권한 정책
supabase/migrations/004_storage_buckets.sql ← 이미지 업로드 버킷
supabase/seed/courses.sql                ← 5개 부산 코스 데이터
```

각 파일을 열어서 내용을 통째로 복사 → SQL Editor에 붙여넣기 → 우측 하단 **Run** 버튼.

**1-2. pg_cron 활성화 (자동 삭제용 - 선택이지만 강력 추천)**

Dashboard → 좌측 `Database` → `Extensions` 메뉴 → `pg_cron` 검색 → 토글 ON

그 다음 `003_cron_jobs.sql`을 SQL Editor에서 실행하세요. 이게 있으면:
- 지난 모임은 매일 새벽 3시(KST)에 자동 삭제
- 모집 마감 지난 크루도 자동 닫힘
- 30일 지난 장터 상품 자동 정리

pg_cron을 활성화 안 하면 이 기능은 작동하지 않습니다. 수동 정리가 필요해요.

**1-3. Storage 버킷 확인**

Dashboard → 좌측 `Storage` → 버킷 3개가 생성되었는지 확인:
- `crews` (크루 사진)
- `market` (상품 사진)
- `courses` (관리자용)

4번 SQL을 실행했으면 자동 생성됩니다.

---

### 2단계: 로컬에서 실행해보기

```bash
# 프로젝트 폴더로 이동
cd busan-runner

# 패키지 설치
npm install

# .env.local 확인 (이미 Supabase 정보가 채워져 있어야 함)
cat .env.local

# 개발 서버 시작
npm run dev
```

브라우저에서 `http://localhost:3000` 접속 → 홈 페이지에서 코스 5개가 보이면 정상!

**뭐가 안 보이면?**
- 개발자 도구(F12) → Console/Network 탭에서 에러 메시지 확인
- `.env.local`의 URL과 키가 맞는지 확인
- Supabase Dashboard → Table Editor에서 `courses` 테이블에 5개 행이 있는지 확인

---

### 3단계: Vercel 배포

**3-1. GitHub 저장소 생성**

```bash
git init
git add .
git commit -m "feat: initial commit - 부산러너"
# GitHub에서 저장소 만든 후
git remote add origin https://github.com/USERNAME/busan-runner.git
git branch -M main
git push -u origin main
```

⚠️ `.env.local`은 `.gitignore`에 포함되어 있어 커밋되지 않습니다(보안). 이건 정상이에요.

**3-2. Vercel 연결**

1. https://vercel.com 로그인
2. `Add New...` → `Project`
3. GitHub 저장소 `busan-runner` 선택 → `Import`
4. **Framework Preset**: Next.js 자동 감지됨 (그대로 두기)
5. **Environment Variables** 섹션에서 아래 두 개 입력:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ldhshrmvunbjoqetsctv.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (`.env.local`에 있는 JWT 토큰 그대로) |

6. `Deploy` 버튼 클릭 → 2~3분 기다리면 완료

**3-3. 커스텀 도메인 (선택)**

Vercel Dashboard → 프로젝트 선택 → `Settings` → `Domains` → 원하는 도메인 추가.

---

## 🧪 테스트 체크리스트

배포 후 아래 기능이 다 되는지 확인하세요:

### 홈
- [ ] 코스 5개가 카드로 표시됨
- [ ] 필터 클릭 (전체/초급/중급/해변/평지) 동작
- [ ] 검색창에 "해운대" 입력 → 필터링됨
- [ ] 코스 카드 하트 클릭 → 채워짐/새로고침해도 유지됨
- [ ] 코스 카드 클릭 → 상세 모달 열림 → 저장 가능
- [ ] "러닝 시작하기" 버튼 → Today's Pick 모달 열림

### 모임 (홈 하단)
- [ ] "모임 만들기" → 폼 작성 → 생성됨
- [ ] 다른 브라우저/시크릿 창에서 열면 그 모임이 보임 (**실DB 연동 증거**)
- [ ] 참가 신청 → 인원 수 증가
- [ ] 내 모임에 "삭제" 버튼 → 확인 팝업 → 삭제

### 크루
- [ ] "크루 모집하기" → 사진 업로드 (2MB 이하 JPG/PNG) → 생성됨
- [ ] 사진 없이 생성하면 테마 일러스트로 표시됨
- [ ] 다른 사람 크루에 "가입 신청" → 인사말 입력 → 승인됨
- [ ] 내 크루 삭제 → 사진도 Storage에서 같이 삭제됨
- [ ] 모집 마감일이 오늘인 크루는 "오늘 마감" 표시

### 장터
- [ ] "상품 올리기" → 사진 + 카테고리 + 가격 → 등록됨
- [ ] "나눔/교환" 선택 시 가격 자동 0 → "나눔" 표시
- [ ] 내 상품에 "상태: 판매중" 메뉴 → "예약중" 변경
- [ ] 댓글 입력 → 등록됨, 판매자 댓글은 "판매자" 태그
- [ ] 좋아요 → 숫자 증가 → 새로고침 후에도 유지

### MY (프로필)
- [ ] "프로필 수정" → 닉네임 입력 중 실시간 "확인 중…" → "✓ 사용 가능"
- [ ] 같은 닉네임을 다른 브라우저에서 시도 → "이미 사용 중" 차단
- [ ] 색상 변경 → 저장 → 장터 댓글 아바타에 반영
- [ ] 5개 탭 전환 (좋아요/저장/크루/모임/장터)

### 언어
- [ ] 우상단 KO/EN 토글 → 모든 UI 영어로
- [ ] 새로고침해도 영어 유지됨 (localStorage)
- [ ] 영어 상태에서 코스명/가격 "Haeundae Beach Trail / 85,000 KRW" 표시

---

## 📁 프로젝트 구조

```
busan-runner/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # 글로벌 레이아웃 (TopBar + BottomNav)
│   │   └── page.tsx          # 메인 페이지 (모든 view 통합)
│   ├── components/
│   │   ├── AppProvider.tsx   # 전역 상태 (lang, profile, toast)
│   │   ├── TopBar.tsx        # 상단바 + 언어 토글
│   │   ├── BottomNav.tsx     # 모바일 하단 네비
│   │   ├── Hero.tsx          # 히어로 섹션
│   │   ├── CourseGrid.tsx    # 코스 리스트
│   │   ├── CourseModal.tsx   # 코스 상세
│   │   ├── MeetList.tsx
│   │   ├── MeetCreateModal.tsx
│   │   ├── CrewGrid.tsx
│   │   ├── CrewCreateModal.tsx  # 사진 업로드 포함
│   │   ├── CrewJoinModal.tsx
│   │   ├── MarketGrid.tsx       # 카드 + 인라인 댓글
│   │   ├── MarketCreateModal.tsx
│   │   ├── ProfilePanel.tsx     # MY 페이지
│   │   ├── ProfileEditModal.tsx # 닉네임 중복체크
│   │   └── ConfirmDialog.tsx    # 공통 삭제 확인
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts     # 브라우저 클라이언트
│   │   │   └── server.ts     # 서버 클라이언트
│   │   ├── hooks/
│   │   │   ├── useCourses.ts
│   │   │   ├── useMeets.ts
│   │   │   ├── useCrews.ts
│   │   │   ├── useMarket.ts
│   │   │   └── useProfile.ts
│   │   ├── database.types.ts # TypeScript 타입
│   │   ├── i18n.ts           # KO/EN 번역 딕셔너리
│   │   ├── session.ts        # localStorage 세션 ID
│   │   ├── image-upload.ts   # 이미지 검증 + Storage 업로드
│   │   └── art.ts            # 코스/크루/장터 SVG 일러스트
│   └── styles/
│       └── globals.css       # 전체 스타일 (약 900줄)
├── supabase/
│   ├── migrations/
│   │   ├── 001_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 003_cron_jobs.sql
│   │   └── 004_storage_buckets.sql
│   └── seed/
│       └── courses.sql
├── .env.example              # 환경변수 템플릿
├── .env.local                # 실제 키 (Git에 안 올라감)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

---

## 🔐 보안 메모

현재 RLS 정책은 **공개 데모용**으로 느슨하게 설정되어 있습니다:
- 모든 사용자(anon)가 테이블을 읽고 쓸 수 있음
- 세션 ID는 localStorage 기반 (로그인 없음)
- 본인 검증은 앱 레벨에서만 수행

**운영 환경에서 추가 필요:**
1. Supabase Auth로 실제 로그인 도입
2. `002_rls_policies.sql`에서 `auth.uid()` 기반 검증으로 강화
3. 악의적 API 직접 호출 방지를 위한 Next.js Route Handlers 경유

지금은 주변 사람들과 부산 러닝 커뮤니티에서 사용하는 MVP 단계라 충분합니다.

---

## 🐛 자주 발생하는 문제

**"Cannot find Supabase URL" 에러**
→ `.env.local` 확인. 파일명 정확한지 체크 (`.env.local` 맞음, `.env` 아님)

**이미지 업로드 실패 "row-level security"**
→ Storage 정책이 안 설정된 것. `004_storage_buckets.sql` 재실행

**코스 0개로 표시됨**
→ `courses.sql` seed 미실행. SQL Editor에서 실행

**"duplicate key value violates unique constraint"**
→ 같은 세션이 이미 좋아요/참가한 것. 정상 동작 (UNIQUE 제약)

**pg_cron이 안 돌아요**
→ Dashboard → Database → Extensions 에서 활성화 토글 확인. 그 다음 `003_cron_jobs.sql` 재실행. `select * from cron.job;` 으로 예약 확인.

**Vercel 배포는 됐는데 페이지가 하얗게 나옴**
→ 환경변수 입력 확인. Vercel Dashboard → Project → Settings → Environment Variables에 2개 다 있는지. 재배포 (Deployments → 최신 → Redeploy) 필요

---

## 🎯 30일 1,000명 유저 획득 전략 (인수인계 문서 기반)

1. **SNS 바이럴** — 인스타/트위터에 앱 URL + 코스 사진
2. **크루 파트너십** — 부산 러닝 크루 5~10개 섭외, 첫 크루로 등록
3. **SEO** — "부산 러닝 코스" 키워드 최적화, 네이버 블로그 체험단

첫 주 목표: 내 주변 10명 → 피드백 수집 → 1주일마다 기능 개선.

---

## 📬 피드백

버그 / 기능 제안이 있으면 GitHub Issues에 남겨주세요!

🏃 Good running, Busan!

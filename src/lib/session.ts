// ============================================================
// 세션 ID 관리 - 로그인 없이 localStorage 기반 사용자 구분
// 실서비스에서는 Supabase Auth로 교체 가능
// ============================================================

const SESSION_KEY = 'br_session';

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let sid = localStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = 'u_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      localStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return 'u_fallback_' + Date.now().toString(36);
  }
}

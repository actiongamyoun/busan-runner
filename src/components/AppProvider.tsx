'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSessionId } from '@/lib/session';
import { type Lang, t as translate } from '@/lib/i18n';
import { createClient } from '@/lib/supabase/client';

const PROFILE_COLORS = ['#FF6B4A', '#4A90E2', '#2ECC71', '#9B59B6', '#F39C12', '#1ABC9C', '#E74C3C', '#34495E'];

export type Profile = {
  nickname: string;
  color: string;
  icon: string;
};

type AppContextValue = {
  sessionId: string;
  lang: Lang;
  setLang: (l: Lang) => void;
  profile: Profile;
  setProfile: (p: Profile) => void;
  t: (key: string) => string;
  showToast: (msg: string) => void;
  view: string;
  setView: (v: string) => void;
  colors: string[];
};

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState('');
  const [lang, setLangState] = useState<Lang>('ko');
  const [profile, setProfileState] = useState<Profile>({ nickname: '익명러너', color: PROFILE_COLORS[0], icon: 'R' });
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [view, setView] = useState('home');

  // 초기 로드 (브라우저에서만)
  useEffect(() => {
    const sid = getSessionId();
    setSessionId(sid);
    try {
      const savedLang = localStorage.getItem('br_lang');
      if (savedLang === 'ko' || savedLang === 'en') setLangState(savedLang);
      const savedProfile = localStorage.getItem('br_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed.nickname) setProfileState(parsed);
      }
    } catch {}

    // DB에서 프로필 불러오기 (로컬보다 우선)
    if (sid) {
      (async () => {
        try {
          const supabase = createClient();
          const { data } = await supabase
            .from('profiles')
            .select('nickname, color, icon')
            .eq('session_id', sid)
            .maybeSingle();
          if (data && data.nickname) {
            const p = { nickname: data.nickname, color: data.color || PROFILE_COLORS[0], icon: data.icon || data.nickname.charAt(0) };
            setProfileState(p);
            try { localStorage.setItem('br_profile', JSON.stringify(p)); } catch {}
          }
        } catch {}
      })();
    }
  }, []);

  // HTML lang 동기화
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.title = lang === 'ko' ? '부산러너 · Busan Runner' : 'Busan Runner · 부산러너';
    }
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem('br_lang', l); } catch {}
  }, []);

  const setProfile = useCallback((p: Profile) => {
    setProfileState(p);
    try { localStorage.setItem('br_profile', JSON.stringify(p)); } catch {}
  }, []);

  const t = useCallback((key: string) => translate(key, lang), [lang]);

  const toastTimer = React.useRef<any>(null);
  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2200);
  }, []);

  const value: AppContextValue = {
    sessionId,
    lang,
    setLang,
    profile,
    setProfile,
    t,
    showToast,
    view,
    setView,
    colors: PROFILE_COLORS,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      <div className={`toast ${toastVisible ? 'show' : ''}`}>{toastMsg}</div>
    </AppContext.Provider>
  );
}

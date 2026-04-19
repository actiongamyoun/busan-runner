'use client';

import { useApp } from './AppProvider';

export function TopBar() {
  const { t, lang, setLang, view, setView, showToast } = useApp();

  const nav = [
    { key: 'home', label: t('nav.home') },
    { key: 'routes', label: t('nav.routes') },
    { key: 'crew', label: t('nav.crew') },
    { key: 'market', label: t('nav.market') },
    { key: 'profile', label: t('nav.profile') },
  ];

  const handleNav = (e: React.MouseEvent, key: string) => {
    e.preventDefault();
    if (key === 'routes') {
      setView('home');
      setTimeout(() => document.getElementById('routesSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } else {
      setView(key);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <div className="brand-mark">B</div>
          <div className="brand-text">
            <div className="ko">{t('brand.ko')}</div>
            <div className="en">{t('brand.en')}</div>
          </div>
        </div>

        <nav className="side-nav">
          {nav.map(n => (
            <a
              key={n.key}
              href="#"
              className={view === n.key || (view === 'home' && n.key === 'home') ? 'active' : ''}
              onClick={(e) => handleNav(e, n.key)}
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="top-actions">
          <div className="lang-toggle">
            <button
              className={lang === 'ko' ? 'active' : ''}
              onClick={() => {
                if (lang === 'ko') return;
                setLang('ko');
                showToast('한국어');
              }}
            >KO</button>
            <button
              className={lang === 'en' ? 'active' : ''}
              onClick={() => {
                if (lang === 'en') return;
                setLang('en');
                showToast('English');
              }}
            >EN</button>
          </div>
          <button className="icon-btn" aria-label="notifications" onClick={() => showToast(t('notif.none'))}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

'use client';

import { useApp } from './AppProvider';

type NavKey = 'home' | 'routes' | 'crew' | 'market' | 'profile';

export function TopBar() {
  const { t, lang, setLang, view, setView, showToast } = useApp();

  const nav: { key: NavKey; label: string }[] = [
    { key: 'home', label: t('nav.home') },
    { key: 'routes', label: t('nav.routes') },
    { key: 'crew', label: t('nav.crew') },
    { key: 'market', label: t('nav.market') },
    { key: 'profile', label: t('nav.profile') },
  ];

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, key: NavKey) => {
    e.preventDefault();

    if (key === 'routes') {
      setView('home');
      // setView 후 DOM 업데이트가 끝난 다음 프레임에 스크롤 (setTimeout보다 안정적)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.getElementById('routesSection')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        });
      });
    } else {
      setView(key);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  const handleLangChange = (next: 'ko' | 'en') => {
    if (lang === next) return;
    setLang(next);
    showToast(next === 'ko' ? '한국어' : 'English');
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <span className="icon">directions_run</span>
          </div>
          <div className="brand-text">
            <div className="ko">{t('brand.ko')}</div>
            <div className="en">{t('brand.en')}</div>
          </div>
        </div>

        <nav className="side-nav" aria-label="Primary">
          {nav.map((n) => {
            const isActive = view === n.key;
            return (
              <a
                key={n.key}
                href={`#${n.key}`}
                className={isActive ? 'active' : ''}
                aria-current={isActive ? 'page' : undefined}
                onClick={(e) => handleNav(e, n.key)}
              >
                {n.label}
              </a>
            );
          })}
        </nav>

        <div className="top-actions">
          <div className="lang-toggle" role="group" aria-label="Language">
            <button
              type="button"
              className={lang === 'ko' ? 'active' : ''}
              aria-pressed={lang === 'ko'}
              onClick={() => handleLangChange('ko')}
            >
              KO
            </button>
            <button
              type="button"
              className={lang === 'en' ? 'active' : ''}
              aria-pressed={lang === 'en'}
              onClick={() => handleLangChange('en')}
            >
              EN
            </button>
          </div>
          <button
            type="button"
            className="icon-btn"
            aria-label={t('notif.none')}
            onClick={() => showToast(t('notif.none'))}
          >
            <span className="icon">notifications</span>
          </button>
        </div>
      </div>
    </header>
  );
}

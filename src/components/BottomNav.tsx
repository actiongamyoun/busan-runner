'use client';

import { useApp } from './AppProvider';

export function BottomNav() {
  const { t, view, setView } = useApp();

  const items = [
    {
      key: 'home', label: t('bnav.home'),
      icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>
    },
    {
      key: 'crew', label: t('bnav.crew'),
      icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>
    },
    {
      key: 'market', label: t('bnav.market'),
      icon: <><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></>
    },
    {
      key: 'courses', label: t('bnav.courses') || '코스',
      icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>
    },
  ];

  const handleClick = (key: string) => {
    setView(key);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <nav className="bottom-nav">
      {items.map(n => (
        <button
          key={n.key}
          className={`nav-item ${view === n.key ? 'active' : ''}`}
          onClick={() => handleClick(n.key)}
        >
          <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">{n.icon}</svg>
          <span>{n.label}</span>
        </button>
      ))}
    </nav>
  );
}

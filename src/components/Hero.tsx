'use client';

import { useApp } from './AppProvider';

type Props = { onStart: () => void };

export function Hero({ onStart }: Props) {
  const { t } = useApp();

  return (
    <section className="hero">
      <div className="hero-grid">
        <div>
          <div className="hero-eyebrow">{t('hero.eyebrow')}</div>
          <h1 className="hero-title serif">
            <span>{t('hero.title.l1')}</span><br />
            <em>{t('hero.title.l2')}</em>,<br />
            <span className="underline">{t('hero.title.l3')}</span>.
          </h1>
          <p className="hero-sub">{t('hero.sub')}</p>
          <div className="hero-stats">
            <div className="stat">
              <div className="n serif">05</div>
              <div className="l">{t('hero.stat.routes')}</div>
            </div>
            <div className="stat">
              <div className="n serif">37.8<span style={{ fontSize: '0.6em' }}>km</span></div>
              <div className="l">{t('hero.stat.distance')}</div>
            </div>
            <div className="stat">
              <div className="n serif">12</div>
              <div className="l">{t('hero.stat.crews')}</div>
            </div>
          </div>
        </div>

        <div
          className="hero-card"
          role="button"
          tabIndex={0}
          onClick={onStart}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStart(); } }}
        >
          <div className="hero-card-bg" />
          <div className="hero-card-mesh" />
          <svg className="hero-card-runner" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="coralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6B4A" />
                <stop offset="100%" stopColor="#FF8B6A" />
              </linearGradient>
            </defs>
            <g fill="url(#coralGrad)">
              <circle cx="175" cy="60" r="16" />
              <path d="M140 90 Q155 80 175 85 L195 100 L220 130 L215 145 L185 130 L175 160 L200 200 L195 250 L175 250 L170 210 L155 175 L130 195 L110 230 L95 220 L120 180 L145 140 Z" />
            </g>
            <g stroke="#FF6B4A" strokeWidth="2" fill="none" opacity="0.4">
              <path d="M20 250 Q80 230 140 240" strokeDasharray="4 6" />
              <path d="M40 270 Q100 250 160 260" strokeDasharray="4 6" />
            </g>
          </svg>
          <div className="hero-card-content">
            <div className="hero-card-tag"><span className="pulse-dot" /> {t('hero.card.tag')}</div>
            <div>
              <div className="hero-card-title serif">
                <span>{t('hero.card.title.l1')}</span><br /><em>{t('hero.card.title.l2')}</em>
              </div>
              <button
                className="hero-card-cta"
                onClick={(e) => { e.stopPropagation(); onStart(); }}
              >
                {t('hero.card.cta')}
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

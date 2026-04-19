'use client';

import { useApp } from './AppProvider';

export type ConfirmMode = 'meet' | 'market' | 'crew' | null;

type Props = {
  mode: ConfirmMode;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({ mode, onCancel, onConfirm }: Props) {
  const { t } = useApp();
  if (!mode) return null;

  const descKey = mode === 'meet' ? 'confirm.desc.meet'
    : mode === 'market' ? 'confirm.desc.market'
    : 'confirm.desc.crew';

  return (
    <div className="confirm-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="confirm-box">
        <div className="ico">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" /><path d="M14 11v6" />
          </svg>
        </div>
        <h3>{t('confirm.title')}</h3>
        <p dangerouslySetInnerHTML={{ __html: t(descKey) }} />
        <div className="confirm-actions">
          <button className="confirm-no" onClick={onCancel}>{t('confirm.no')}</button>
          <button className="confirm-yes" onClick={onConfirm}>{t('confirm.yes')}</button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useApp } from './AppProvider';
import type { Crew } from '@/lib/database.types';

type Props = {
  crew: Crew | null;
  onClose: () => void;
  onSubmit: (greeting: string) => Promise<'joined' | 'full'>;
};

function calcDday(dateStr: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const until = new Date(dateStr); until.setHours(0, 0, 0, 0);
  return Math.round((until.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function CrewJoinModal({ crew, onClose, onSubmit }: Props) {
  const { t, lang, showToast } = useApp();
  const [greeting, setGreeting] = useState('');
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!crew) return;
    setGreeting(''); setError(false);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [crew]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (crew) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [crew, onClose]);

  if (!crew) return null;

  const handleSubmit = async () => {
    const g = greeting.trim();
    if (g.length < 5) {
      setError(true);
      showToast(t('crew.join.greeting.warn'));
      return;
    }
    setSubmitting(true);
    try {
      const result = await onSubmit(g);
      if (result === 'full') {
        showToast(t('crew.join.full.warn'));
      } else {
        showToast(t('crew.join.success'));
        onClose();
      }
    } catch (e) {
      console.error(e);
      showToast(t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const dday = calcDday(crew.recruit_until);
  let ddayText;
  if (dday === 0) ddayText = t('crew.dday.today');
  else if (dday === 1) ddayText = t('crew.dday.tomorrow');
  else ddayText = `D-${dday}`;
  const peopleUnit = lang === 'ko' ? '명' : '';

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true">
        <span className="modal-handle" />
        <div className="modal-header">
          <div>
            <div className="modal-eyebrow">{t('crew.join.modal.eyebrow')}</div>
            <h2 className="modal-title">{crew.name}</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="modal-body">
          <div style={{ fontSize: 13, color: 'var(--mute)', lineHeight: 1.6, padding: 16, background: 'var(--cream)', borderRadius: 8, marginBottom: 20 }}>
            <div style={{ fontWeight: 600, color: 'var(--navy-ink)', marginBottom: 4 }}>{crew.name}</div>
            {crew.schedule} · {t('crew.pace.prefix')}{crew.pace}<br />
            {t('crew.join.info.current')}{crew.joined}{peopleUnit}{t('crew.join.info.limit')}{crew.member_limit}{peopleUnit} · <span style={{ color: 'var(--coral)', fontWeight: 600 }}>{ddayText}</span>
          </div>
          <div className={`form-group ${error ? 'error' : ''}`}>
            <label className="form-label">{t('crew.join.greeting.label')} <span style={{ color: 'var(--coral)' }}>*</span></label>
            <textarea
              className="form-textarea"
              value={greeting}
              onChange={e => { setGreeting(e.target.value); if (error) setError(false); }}
              maxLength={150}
              placeholder={t('crew.join.greeting.placeholder')}
              style={{ minHeight: 90 }}
            />
            <div className="form-hint">{t('crew.join.greeting.hint')}</div>
            <div className="form-error">{t('crew.join.greeting.error')}</div>
          </div>
          <div className="modal-actions">
            <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? t('common.loading') : t('crew.join.submit')}
            </button>
            <button className="btn-secondary" onClick={onClose} disabled={submitting}>{t('crew.join.cancel')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

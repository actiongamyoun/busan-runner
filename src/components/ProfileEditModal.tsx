'use client';

import { useState, useEffect, useRef } from 'react';
import { useApp } from './AppProvider';
import { isNicknameTaken, saveProfileToDb } from '@/lib/hooks/useProfile';

type Props = {
  open: boolean;
  onClose: () => void;
};

type MsgState = { text: string; kind: 'ok' | 'bad' | 'checking' | '' };

export function ProfileEditModal({ open, onClose }: Props) {
  const { t, showToast, sessionId, profile, setProfile, colors } = useApp();

  const [nickname, setNickname] = useState('');
  const [color, setColor] = useState(profile.color);
  const [msg, setMsg] = useState<MsgState>({ text: '', kind: '' });
  const checkTimer = useRef<any>(null);

  useEffect(() => {
    if (!open) return;
    const nick = profile.nickname;
    setNickname(nick === '익명러너' || nick === 'Anonymous' ? '' : nick);
    setColor(profile.color);
    setMsg({ text: '', kind: '' });
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      if (checkTimer.current) clearTimeout(checkTimer.current);
    };
  }, [open, profile]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;

  const validateLocal = (v: string): { ok: boolean; text: string; kind: MsgState['kind'] } => {
    if (v.length < 2) return { ok: false, text: t('profile.nick.short'), kind: 'bad' };
    if (v.length > 12) return { ok: false, text: t('profile.nick.long'), kind: 'bad' };
    if (!/^[a-zA-Z0-9가-힣_-]+$/.test(v)) return { ok: false, text: t('profile.nick.invalid'), kind: 'bad' };
    if (v === '익명러너' || v === 'Anonymous') return { ok: false, text: t('profile.nick.reserved'), kind: 'bad' };
    return { ok: true, text: '', kind: '' };
  };

  const handleChange = (v: string) => {
    setNickname(v);
    if (checkTimer.current) clearTimeout(checkTimer.current);
    if (!v) { setMsg({ text: '', kind: '' }); return; }

    const local = validateLocal(v);
    if (!local.ok) {
      setMsg({ text: local.text, kind: local.kind });
      return;
    }
    setMsg({ text: t('profile.nick.checking'), kind: 'checking' });
    checkTimer.current = setTimeout(async () => {
      const taken = await isNicknameTaken(v, sessionId);
      if (taken) setMsg({ text: t('profile.nick.taken'), kind: 'bad' });
      else setMsg({ text: t('profile.nick.ok'), kind: 'ok' });
    }, 250);
  };

  const handleSave = async () => {
    const v = nickname.trim();
    const local = validateLocal(v);
    if (!local.ok) {
      setMsg({ text: local.text, kind: 'bad' });
      showToast(t('profile.nick.warn'));
      return;
    }
    // 최종 중복체크
    const taken = await isNicknameTaken(v, sessionId);
    if (taken) {
      setMsg({ text: t('profile.nick.taken'), kind: 'bad' });
      showToast(t('profile.nick.warn'));
      return;
    }
    try {
      await saveProfileToDb(sessionId, v, color);
      setProfile({ nickname: v, color, icon: v.charAt(0) });
      showToast(t('profile.save.toast'));
      onClose();
    } catch (e) {
      console.error(e);
      showToast(t('common.error'));
    }
  };

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true">
        <span className="modal-handle" />
        <div className="modal-header">
          <div>
            <div className="modal-eyebrow">{t('profile.modal.eyebrow')}</div>
            <h2 className="modal-title">{t('profile.modal.title')}</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">{t('profile.modal.nick.label')} <span style={{ color: 'var(--coral)' }}>*</span></label>
            <input
              className="form-input"
              value={nickname}
              onChange={e => handleChange(e.target.value)}
              maxLength={12}
              placeholder={t('profile.modal.nick.placeholder')}
              autoFocus
            />
            <div className="form-hint">{t('profile.modal.nick.hint')}</div>
            {msg.text && <div className={`nick-check-msg ${msg.kind}`}>{msg.text}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">{t('profile.modal.color.label')}</label>
            <div className="color-picker">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`color-swatch ${color === c ? 'active' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn-primary" onClick={handleSave}>{t('profile.modal.save')}</button>
            <button className="btn-secondary" onClick={onClose}>{t('profile.modal.cancel')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

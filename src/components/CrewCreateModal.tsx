'use client';

import { useState, useEffect } from 'react';
import { useApp } from './AppProvider';
import { validateImage, fileToDataUrl, uploadImage } from '@/lib/image-upload';
import { crewHeroArt } from '@/lib/art';

const THEMES = ['sunrise', 'night', 'river', 'cliff'] as const;

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: {
    name: string; area: string; level: string; schedule: string; pace: string;
    description: string; photo_url: string | null; theme: string;
    member_limit: number; recruit_until: string;
    host_nick: string; host_color: string;
    type: '단기' | '장기';  // ← 추가
  }) => Promise<void>;
};

export function CrewCreateModal({ open, onClose, onSubmit }: Props) {
  const { t, lang, showToast, sessionId, profile } = useApp();

  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [level, setLevel] = useState('초중급');
  const [schedule, setSchedule] = useState('');
  const [pace, setPace] = useState('');
  const [description, setDescription] = useState('');
  const [memberLimit, setMemberLimit] = useState('15');
  const [recruitUntil, setRecruitUntil] = useState('');
  const [theme, setTheme] = useState<string>('sunrise');
  const [crewType, setCrewType] = useState<'단기' | '장기'>('장기');  // ← 추가

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!open) return;
    setName(''); setArea(''); setLevel('초중급');
    setSchedule(''); setPace(''); setDescription('');
    setMemberLimit('15'); setTheme('sunrise'); setCrewType('장기');
    setPhotoFile(null); setPhotoPreview(''); setPhotoError('');
    setErrors({});
    const d = new Date(); d.setDate(d.getDate() + 14);
    setRecruitUntil(d.toISOString().slice(0, 10));
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError('');
    try {
      await validateImage(file, lang);
      const preview = await fileToDataUrl(file);
      setPhotoFile(file);
      setPhotoPreview(preview);
    } catch (err: any) {
      setPhotoError(err.message || t('img.err.read'));
      showToast('⚠️ ' + (err.message || t('img.err.read')));
      setPhotoFile(null);
      setPhotoPreview('');
      e.target.value = '';
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    setPhotoError('');
  };

  const validate = () => {
    const err: Record<string, boolean> = {};
    if (!name.trim()) err.name = true;
    if (!area.trim()) err.area = true;
    if (!schedule.trim()) err.schedule = true;
    if (!pace.trim()) err.pace = true;
    if (description.trim().length < 10) err.description = true;
    const lim = parseInt(memberLimit);
    if (!lim || lim < 2 || lim > 100) err.limit = true;
    if (!recruitUntil) err.until = true;
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      showToast(t('common.form.warn'));
      return;
    }
    const until = new Date(recruitUntil);
    const today = new Date(); today.setHours(0,0,0,0);
    if (until <= today) {
      setErrors(e => ({ ...e, until: true }));
      showToast(t('common.form.warn'));
      return;
    }

    setSubmitting(true);
    try {
      let photoUrl: string | null = null;
      if (photoFile) {
        photoUrl = await uploadImage('crews', photoFile, sessionId);
      }
      await onSubmit({
        name: name.trim(),
        area: area.trim(),
        level,
        schedule: schedule.trim(),
        pace: pace.trim(),
        description: description.trim(),
        photo_url: photoUrl,
        theme,
        member_limit: parseInt(memberLimit),
        recruit_until: recruitUntil,
        host_nick: profile.nickname,
        host_color: profile.color,
        type: crewType,
      });
      showToast(t('crew.created.toast'));
      onClose();
    } catch (e: any) {
      console.error(e);
      showToast(t('img.err.upload'));
    } finally {
      setSubmitting(false);
    }
  };

  const themeLabels: Record<string, string> = {
    sunrise: t('crew.theme.sunrise'),
    night: t('crew.theme.night'),
    river: t('crew.theme.river'),
    cliff: t('crew.theme.cliff'),
  };

  const today = new Date(); today.setDate(today.getDate() + 1);
  const minDate = today.toISOString().slice(0, 10);

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true">
        <span className="modal-handle" />
        <div className="modal-header">
          <div>
            <div className="modal-eyebrow">{t('crew.modal.new')}</div>
            <h2 className="modal-title">{t('crew.modal.title')}</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="modal-body">

          {/* 크루 타입 선택 — 단기/장기 */}
          <div className="form-group">
            <label className="form-label">크루 유형</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['장기', '단기'] as const).map(tp => (
                <button
                  key={tp}
                  type="button"
                  onClick={() => setCrewType(tp)}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    borderRadius: 12,
                    border: '1.5px solid',
                    borderColor: crewType === tp ? 'var(--navy-ink)' : 'var(--line)',
                    background: crewType === tp ? 'var(--navy-ink)' : 'transparent',
                    color: crewType === tp ? '#fff' : 'var(--navy-ink)',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {tp === '장기' ? '🏃 정기 크루' : '⚡ 단기 (1회성)'}
                </button>
              ))}
            </div>
            <div className="form-hint" style={{ marginTop: 6 }}>
              {crewType === '장기'
                ? '매주 정기적으로 함께 달리는 크루예요'
                : '특정 날짜에 한 번 모이는 번개 모임이에요'}
            </div>
          </div>

          {/* 사진 업로드 */}
          <div className={`form-group ${photoError ? 'error' : ''}`}>
            <label className="form-label">
              {t('crew.modal.photo.label')}
              <span style={{ color: 'var(--mute)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                {' '}{t('crew.modal.photo.optional')}
              </span>
            </label>
            <div className={`img-upload ${photoPreview ? 'has-image' : ''}`}>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
              {photoPreview && <img src={photoPreview} alt="" />}
              {!photoPreview && (
                <div className="img-upload-placeholder">
                  <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <div className="t">{t('crew.modal.photo.cta')}</div>
                  <div className="s">{t('crew.modal.photo.hint')}</div>
                </div>
              )}
              {photoPreview && (
                <button type="button" className="img-upload-remove" onClick={(e) => { e.stopPropagation(); removePhoto(); }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
            <div className="form-hint">{t('crew.modal.photo.below')}</div>
            {photoError && <div style={{ fontSize: 11, color: '#C84A3C', marginTop: 6 }}>{photoError}</div>}

            {/* 테마 선택 */}
            <div className="theme-picker">
              {THEMES.map(tk => (
                <button
                  key={tk}
                  type="button"
                  className={`theme-swatch ${theme === tk ? 'active' : ''}`}
                  onClick={() => setTheme(tk)}
                >
                  <div dangerouslySetInnerHTML={{ __html: crewHeroArt(tk, 'tp' + tk) }} />
                  <span className="lbl">{themeLabels[tk]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={`form-group ${errors.name ? 'error' : ''}`}>
            <label className="form-label">{t('crew.modal.name.label')}</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} maxLength={30} placeholder={t('crew.modal.name.placeholder')} />
            <div className="form-error">{t('crew.modal.name.error')}</div>
          </div>

          <div className="form-group row">
            <div className={errors.area ? 'error' : ''}>
              <label className="form-label">{t('crew.modal.area.label')}</label>
              <input className="form-input" value={area} onChange={e => setArea(e.target.value)} maxLength={20} placeholder={t('crew.modal.area.placeholder')} />
              {errors.area && <div style={{ fontSize: 11, color: '#C84A3C', marginTop: 6 }}>{t('crew.modal.area.error')}</div>}
            </div>
            <div>
              <label className="form-label">{t('crew.modal.level.label')}</label>
              <select className="form-select" value={level} onChange={e => setLevel(e.target.value)}>
                <option value="초급">{t('level.beginner')}</option>
                <option value="초중급">{t('level.beginner-int')}</option>
                <option value="중급">{t('level.intermediate')}</option>
                <option value="중상급">{t('level.intermediate-adv')}</option>
                <option value="상급">{t('level.advanced')}</option>
              </select>
            </div>
          </div>

          <div className="form-group row">
            <div className={errors.schedule ? 'error' : ''}>
              <label className="form-label">{t('crew.modal.schedule.label')}</label>
              <input className="form-input" value={schedule} onChange={e => setSchedule(e.target.value)} maxLength={30} placeholder={t('crew.modal.schedule.placeholder')} />
              {errors.schedule && <div style={{ fontSize: 11, color: '#C84A3C', marginTop: 6 }}>{t('crew.modal.schedule.error')}</div>}
            </div>
            <div className={errors.pace ? 'error' : ''}>
              <label className="form-label">{t('crew.modal.pace.label')}</label>
              <input className="form-input" value={pace} onChange={e => setPace(e.target.value)} maxLength={20} placeholder={t('crew.modal.pace.placeholder')} />
              {errors.pace && <div style={{ fontSize: 11, color: '#C84A3C', marginTop: 6 }}>{t('crew.modal.pace.error')}</div>}
            </div>
          </div>

          <div className="form-group row">
            <div className={errors.limit ? 'error' : ''}>
              <label className="form-label">{t('crew.modal.limit.label')}</label>
              <input className="form-input" type="number" min={2} max={100} value={memberLimit} onChange={e => setMemberLimit(e.target.value)} />
              {errors.limit && <div style={{ fontSize: 11, color: '#C84A3C', marginTop: 6 }}>{t('crew.modal.limit.error')}</div>}
            </div>
            <div className={errors.until ? 'error' : ''}>
              <label className="form-label">{t('crew.modal.until.label')}</label>
              <input className="form-input" type="date" value={recruitUntil} min={minDate} onChange={e => setRecruitUntil(e.target.value)} />
              {errors.until && <div style={{ fontSize: 11, color: '#C84A3C', marginTop: 6 }}>{t('crew.modal.until.error')}</div>}
            </div>
          </div>

          <div className={`form-group ${errors.description ? 'error' : ''}`}>
            <label className="form-label">{t('crew.modal.desc.label')}</label>
            <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} maxLength={300} placeholder={t('crew.modal.desc.placeholder')} />
            <div className="form-error">{t('crew.modal.desc.error')}</div>
          </div>

          <div className="modal-actions">
            <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? t('common.loading') : t('crew.modal.submit')}
            </button>
            <button className="btn-secondary" onClick={onClose} disabled={submitting}>{t('crew.modal.cancel')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

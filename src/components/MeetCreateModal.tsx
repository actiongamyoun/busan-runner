'use client';

import { useEffect, useState } from 'react';
import { useApp } from './AppProvider';
import type { Course } from '@/lib/database.types';

type Props = {
  open: boolean;
  courses: Course[];
  onClose: () => void;
  onSubmit: (input: {
    title: string; meet_date: string; meet_time: string;
    course_id: number; course_name: string; spots: number; memo: string;
  }) => Promise<void>;
};

export function MeetCreateModal({ open, courses, onClose, onSubmit }: Props) {
  const { t, lang, showToast } = useApp();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('19:00');
  const [courseId, setCourseId] = useState('');
  const [spots, setSpots] = useState('6');
  const [memo, setMemo] = useState('');
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // 열릴 때마다 리셋
  useEffect(() => {
    if (!open) return;
    setTitle(''); setTime('19:00'); setCourseId(''); setSpots('6'); setMemo('');
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().slice(0, 10));
    setErrors({});
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const validate = () => {
    const err: Record<string, boolean> = {};
    if (!title.trim()) err.title = true;
    if (!date) err.date = true;
    if (!time) err.time = true;
    if (!courseId) err.course = true;
    const spotsNum = parseInt(spots);
    if (!spotsNum || spotsNum < 2 || spotsNum > 50) err.spots = true;
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      showToast(t('common.form.warn'));
      return;
    }
    const selectedDate = new Date(date); selectedDate.setHours(0, 0, 0, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setErrors(e => ({ ...e, date: true }));
      showToast(t('meet.past.date.warn'));
      return;
    }
    const course = courses.find(c => c.id === parseInt(courseId));
    if (!course) return;
    try {
      await onSubmit({
        title: title.trim(),
        meet_date: date,
        meet_time: time.length === 5 ? time + ':00' : time,
        course_id: course.id,
        course_name: course.name,
        spots: parseInt(spots),
        memo: memo.trim(),
      });
      showToast(t('meet.created.toast'));
      onClose();
    } catch (e: any) {
      showToast(t('common.error'));
      console.error(e);
    }
  };

  return (
    <div
      className="modal-overlay open"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal" role="dialog" aria-modal="true">
        <span className="modal-handle" />
        <div className="modal-header">
          <div>
            <div className="modal-eyebrow">{t('meet.modal.new')}</div>
            <h2 className="modal-title">{t('meet.modal.title')}</h2>
          </div>
          <button className="modal-close" aria-label="close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <div className={`form-group ${errors.title ? 'error' : ''}`}>
            <label className="form-label">{t('meet.modal.title.label')}</label>
            <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder={t('meet.modal.title.placeholder')} maxLength={40} />
            <div className="form-error">{t('meet.modal.title.error')}</div>
          </div>

          <div className="form-group row">
            <div className={errors.date ? 'error' : ''}>
              <label className="form-label">{t('meet.modal.date.label')}</label>
              <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
              {errors.date && <div style={{ fontSize: 11, color: '#C84A3C', marginTop: 6 }}>{t('meet.modal.date.error')}</div>}
            </div>
            <div className={errors.time ? 'error' : ''}>
              <label className="form-label">{t('meet.modal.time.label')}</label>
              <input className="form-input" type="time" value={time} onChange={e => setTime(e.target.value)} />
              {errors.time && <div style={{ fontSize: 11, color: '#C84A3C', marginTop: 6 }}>{t('meet.modal.time.error')}</div>}
            </div>
          </div>

          <div className={`form-group ${errors.course ? 'error' : ''}`}>
            <label className="form-label">{t('meet.modal.course.label')}</label>
            <select className="form-select" value={courseId} onChange={e => setCourseId(e.target.value)}>
              <option value="">{t('meet.modal.course.placeholder')}</option>
              {courses.map(c => {
                const n = lang === 'en' ? (c.name_en || c.name) : c.name;
                return <option key={c.id} value={c.id}>{n}</option>;
              })}
            </select>
            <div className="form-error">{t('meet.modal.course.error')}</div>
          </div>

          <div className={`form-group ${errors.spots ? 'error' : ''}`}>
            <label className="form-label">{t('meet.modal.spots.label')}</label>
            <input className="form-input" type="number" min={2} max={50} value={spots} onChange={e => setSpots(e.target.value)} />
            <div className="form-hint">{t('meet.modal.spots.hint')}</div>
            <div className="form-error">{t('meet.modal.spots.error')}</div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('meet.modal.memo.label')}</label>
            <textarea className="form-textarea" value={memo} onChange={e => setMemo(e.target.value)} placeholder={t('meet.modal.memo.placeholder')} maxLength={100} />
          </div>

          <div className="modal-actions">
            <button className="btn-primary" onClick={handleSubmit}>{t('meet.modal.submit')}</button>
            <button className="btn-secondary" onClick={onClose}>{t('meet.modal.cancel')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

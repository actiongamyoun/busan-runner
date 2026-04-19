'use client';

import { useEffect } from 'react';
import { useApp } from './AppProvider';
import type { Course } from '@/lib/database.types';
import { courseArt } from '@/lib/art';

type Props = {
  course: Course | null;
  isSaved: boolean;
  onClose: () => void;
  onToggleSave: () => void;
  onStart: () => void;
};

export function CourseModal({ course, isSaved, onClose, onToggleSave, onStart }: Props) {
  const { t, lang } = useApp();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (course) {
      document.addEventListener('keydown', handler);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handler);
        document.body.style.overflow = '';
      };
    }
  }, [course, onClose]);

  if (!course) return null;

  const displayName = lang === 'en' ? (course.name_en || course.name) : course.name;
  const displayDistrict = lang === 'en' ? (course.district_en || course.district) : course.district;
  const displayType = lang === 'en' ? (course.course_type_en || course.course_type) : course.course_type;
  const displayDesc = lang === 'en' ? (course.description_en || course.description) : course.description;
  const displayTags = lang === 'en' ? (course.tags_en || course.tags || []) : (course.tags || []);

  return (
    <div
      className="modal-overlay open"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal" role="dialog" aria-modal="true">
        <span className="modal-handle" />
        <div className="modal-header">
          <div>
            <div className="modal-eyebrow">{t('course.modal.tag.prefix')}{displayType} · {displayDistrict}</div>
            <h2 className="modal-title">{displayName}</h2>
          </div>
          <button className="modal-close" aria-label="close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="modal-media" dangerouslySetInnerHTML={{ __html: courseArt(course) }} />
          <div className="modal-stats">
            <div className="modal-stat"><div className="v serif">{course.distance_km}{t('unit.km')}</div><div className="k">{t('stat.distance')}</div></div>
            <div className="modal-stat"><div className="v serif">{course.duration_min}{t('unit.min')}</div><div className="k">{t('stat.time')}</div></div>
            <div className="modal-stat"><div className="v serif">{course.elevation_m}{t('unit.m')}</div><div className="k">{t('stat.elevation')}</div></div>
            <div className="modal-stat"><div className="v serif">{course.rating}</div><div className="k">{t('stat.rating')}</div></div>
          </div>
          <p className="modal-desc">{displayDesc}</p>
          <div className="modal-tags">
            {displayTags.map((tg, i) => <span key={i} className="modal-tag">#{tg}</span>)}
          </div>
          <div className="modal-actions">
            <button className="btn-primary" onClick={onStart}>{t('course.modal.start')}</button>
            <button className="btn-secondary" onClick={onToggleSave}>
              {isSaved ? t('course.modal.saved') : t('course.modal.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

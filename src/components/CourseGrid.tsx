'use client';

import { useMemo } from 'react';
import { useApp } from './AppProvider';
import type { Course } from '@/lib/database.types';
import { courseArt } from '@/lib/art';

type Props = {
  courses: Course[];
  likedIds: Set<number>;
  filter: string;
  search: string;
  onFilterChange: (f: string) => void;
  onLikeToggle: (id: number) => void;
  onCardClick: (course: Course) => void;
};

export function CourseGrid({ courses, likedIds, filter, search, onFilterChange, onLikeToggle, onCardClick }: Props) {
  const { t, lang } = useApp();

  const filters = [
    { key: 'all', label: t('filter.all'), count: courses.length },
    { key: '초급', label: t('filter.beginner') },
    { key: '중급', label: t('filter.intermediate') },
    { key: '해변', label: t('filter.beach') },
    { key: '평지', label: t('filter.flat') },
  ];

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return courses.filter(c => {
      const matchFilter = filter === 'all' ? true
        : (filter === '초급' || filter === '중급') ? c.difficulty === filter
        : c.course_type === filter;
      const matchSearch = !q || c.name.toLowerCase().includes(q)
        || (c.name_en || '').toLowerCase().includes(q)
        || (c.district || '').toLowerCase().includes(q)
        || (c.tags || []).some(tg => tg.toLowerCase().includes(q));
      return matchFilter && matchSearch;
    });
  }, [courses, filter, search]);

  if (filtered.length === 0) {
    return (
      <>
        <div className="filters">
          {filters.map(f => (
            <button
              key={f.key}
              className={`chip ${filter === f.key ? 'active' : ''}`}
              onClick={() => onFilterChange(f.key)}
            >{f.label}{f.count !== undefined && <span className="count">{f.count}</span>}</button>
          ))}
        </div>
        <div className="empty">
          <div className="empty-mark">{t('course.empty.mark')}</div>
          <div>{t('course.empty.desc')}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="filters">
        {filters.map(f => (
          <button
            key={f.key}
            className={`chip ${filter === f.key ? 'active' : ''}`}
            onClick={() => onFilterChange(f.key)}
          >{f.label}{f.count !== undefined && <span className="count">{f.count}</span>}</button>
        ))}
      </div>

      <div className="course-grid">
        {filtered.map(c => {
          const liked = likedIds.has(c.id);
          const displayName = lang === 'en' ? (c.name_en || c.name) : c.name;
          const displayDistrict = lang === 'en' ? (c.district_en || c.district) : c.district;
          const displayType = lang === 'en' ? (c.course_type_en || c.course_type) : c.course_type;
          const displayDifficulty = lang === 'en' ? (c.difficulty_en || c.difficulty) : c.difficulty;
          const displayDesc = lang === 'en' ? (c.description_en || c.description) : c.description;

          return (
            <article key={c.id} className="course-card" onClick={() => onCardClick(c)}>
              <div className="course-media">
                <div className="course-media-art" dangerouslySetInnerHTML={{ __html: courseArt(c) }} />
                <span className={`course-badge ${c.difficulty !== '초급' ? 'coral' : ''}`}>{displayDifficulty}</span>
                <button
                  className={`course-like ${liked ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); onLikeToggle(c.id); }}
                  aria-label="like"
                >
                  <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>
              <div className="course-body">
                <div className="course-meta-top">
                  <span>{displayDistrict}</span>
                  <span className="dot" />
                  <span>{displayType}</span>
                </div>
                <h3 className="course-name serif">{displayName}</h3>
                <p className="course-desc">{displayDesc}</p>
                <div className="course-stats">
                  <div className="course-stat">
                    <span className="v">{c.distance_km}{t('unit.km')}</span>
                    <span className="k">{t('stat.distance')}</span>
                  </div>
                  <div className="course-stat">
                    <span className="v">{c.duration_min}{t('unit.min')}</span>
                    <span className="k">{t('stat.time')}</span>
                  </div>
                  <div className="course-rating">
                    <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    {c.rating}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

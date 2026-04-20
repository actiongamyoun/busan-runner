'use client';

import { useState } from 'react';
import { useApp } from './AppProvider';
import { crewHeroArt } from '@/lib/art';
import type { Crew, CrewJoin } from '@/lib/database.types';

type CrewType = '전체' | '단기' | '장기';

type Props = {
  crews: Crew[];
  joinedIds: Set<number>;
  myApplicants: Record<number, CrewJoin[]>;
  onJoin: (crew: Crew) => void;
  onLeave: (id: number) => void;
  onDelete: (id: number) => void;
};

function calcDday(dateStr: string): { days: number; urgent: boolean } {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const until = new Date(dateStr); until.setHours(0, 0, 0, 0);
  const days = Math.round((until.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return { days, urgent: days <= 2 };
}

export function CrewGrid({ crews, joinedIds, myApplicants, onJoin, onLeave, onDelete }: Props) {
  const { t, sessionId } = useApp();
  const [crewType, setCrewType] = useState<CrewType>('전체');

  const levelMap: Record<string, string> = {
    '초급': t('level.beginner'),
    '초중급': t('level.beginner-int'),
    '중급': t('level.intermediate'),
    '중상급': t('level.intermediate-adv'),
    '상급': t('level.advanced'),
  };

  const typeTabs: { key: CrewType; label: string }[] = [
    { key: '전체', label: '전체' },
    { key: '단기', label: '단기 (1회성)' },
    { key: '장기', label: '정기 크루' },
  ];

  const filtered = crewType === '전체'
    ? crews
    : crews.filter(c => (c.type ?? '장기') === crewType);

  if (crews.length === 0) {
    return (
      <div className="my-empty" style={{ gridColumn: '1 / -1' }}>
        <div className="my-empty-mark">{t('crew.empty.mark')}</div>
        <p>{t('crew.empty.desc')}</p>
      </div>
    );
  }

  return (
    <>
      {/* 단기/장기 탭 */}
      <div className="filters" style={{ marginBottom: 16 }}>
        {typeTabs.map(tb => {
          const count = tb.key === '전체'
            ? crews.length
            : crews.filter(c => (c.type ?? '장기') === tb.key).length;
          return (
            <button
              key={tb.key}
              className={`chip ${crewType === tb.key ? 'active' : ''}`}
              onClick={() => setCrewType(tb.key)}
            >
              {tb.label}
              <span className="count">{count}</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="my-empty">
          <div className="my-empty-mark">🏃</div>
          <p>{crewType === '단기' ? '단기 모임이 없어요' : '정기 크루가 없어요'}</p>
        </div>
      ) : (
        <div className="crew-grid">
          {filtered.map(crew => {
            const isMine = crew.creator_session === sessionId;
            const isJoined = joinedIds.has(crew.id);
            const applicantCount = (myApplicants[crew.id] || []).length;
            const dday = calcDday(crew.recruit_until);
            const isFull = crew.joined >= crew.member_limit;
            const displayLevel = levelMap[crew.level || ''] || crew.level || '';
            const crewTypeLabel = (crew.type ?? '장기') === '단기' ? '1회성' : '정기';

            let ddayText;
            if (dday.days === 0) ddayText = t('crew.dday.today');
            else if (dday.days === 1) ddayText = t('crew.dday.tomorrow');
            else ddayText = `D-${dday.days}`;

            let btn;
            if (isMine) {
              btn = <button className="crew-delete-btn" onClick={() => onDelete(crew.id)}>{t('crew.delete')}</button>;
            } else if (isJoined) {
              btn = <button className="crew-btn joined" onClick={() => onLeave(crew.id)}>{t('crew.joined')}</button>;
            } else if (isFull) {
              btn = <button className="crew-btn closed" disabled>{t('crew.full')}</button>;
            } else {
              btn = <button className="crew-btn" onClick={() => onJoin(crew)}>{t('crew.join')}</button>;
            }

            return (
              <article key={crew.id} className="crew-card">
                <div className="crew-hero">
                  {crew.photo_url ? (
                    <img src={crew.photo_url} alt={crew.name} />
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: crewHeroArt(crew.theme, crew.id) }} />
                  )}
                  <span className={`crew-hero-dday ${dday.urgent ? 'urgent' : ''}`}>
                    <span>{ddayText}</span>
                  </span>
                  {/* 단기/장기 배지 */}
                  <span style={{
                    position: 'absolute', top: 10, left: 10,
                    background: (crew.type ?? '장기') === '단기' ? 'var(--coral)' : 'var(--navy-ink)',
                    color: '#fff', fontSize: 10, fontWeight: 700,
                    padding: '2px 7px', borderRadius: 20,
                  }}>
                    {crewTypeLabel}
                  </span>
                  {isMine && <span className="crew-mine">{t('crew.mine')}</span>}
                </div>
                <div className="crew-body">
                  <div className="crew-head">
                    <div style={{ minWidth: 0 }}>
                      <div className="crew-name serif">{crew.name}</div>
                      <div className="crew-area">{crew.area} · {displayLevel} · {crew.host_nick}</div>
                    </div>
                    <div className="crew-members">
                      <div className="n">{crew.joined}/{crew.member_limit}</div>
                      <div className="l">{t('crew.members')}</div>
                    </div>
                  </div>
                  <p className="crew-desc">{crew.description}</p>
                  {isMine && applicantCount > 0 && (
                    <div className="crew-applicants">
                      <b>{applicantCount}</b>{t('crew.applicants.msg.suffix')}
                    </div>
                  )}
                </div>
                <div className="crew-foot">
                  <div className="crew-schedule">
                    <b>{crew.schedule}</b><br />
                    {t('crew.pace.prefix')}{crew.pace}
                  </div>
                  {btn}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

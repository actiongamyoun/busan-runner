'use client';

import { useApp } from './AppProvider';
import { formatMeetDate } from '@/lib/i18n';
import type { Meet } from '@/lib/database.types';

type Props = {
  meets: Meet[];
  joinedIds: Set<number>;
  onJoinToggle: (id: number) => void;
  onDelete: (id: number) => void;
};

function calcDday(dateStr: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr); target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function MeetList({ meets, joinedIds, onJoinToggle, onDelete }: Props) {
  const { t, lang, sessionId } = useApp();

  if (meets.length === 0) {
    return (
      <div className="empty">
        <div className="empty-mark">{t('my.empty.meets.mark')}</div>
        <div>{t('my.empty.meets.desc')}</div>
      </div>
    );
  }

  const peopleUnit = lang === 'ko' ? '명' : '';

  return (
    <div className="meet-list">
      {meets.map(m => {
        const isMine = m.creator_session === sessionId;
        const isJoined = joinedIds.has(m.id);
        const dday = calcDday(m.meet_date);
        const ddayText = dday === 0 ? t('meet.today') : dday === 1 ? t('meet.tomorrow') : `D-${dday}`;
        const ddayDisplay = dday === 0 ? '●' : `D-${dday}`;
        const urgent = dday <= 1;
        const joinCount = m.joined;

        return (
          <div key={m.id} className="meet-card">
            <div className={`meet-dday ${urgent ? 'urgent' : ''}`}>
              <div className="d serif">{ddayDisplay}</div>
              <div className="l">{ddayText}</div>
            </div>
            <div className="meet-info">
              {isMine && <div className="meet-mine-badge">{t('meet.mine.badge')}</div>}
              <h3>{m.title}</h3>
              <div className="meta">
                <span>📍 {m.course_name}</span>
                <span className="sep" />
                <span>{formatMeetDate(m.meet_date, m.meet_time, lang)}</span>
                {m.memo && <><span className="sep" /><span>{m.memo}</span></>}
              </div>
            </div>
            <div className="meet-join">
              <div className="meet-spots">
                <b>{joinCount}</b> / {m.spots}{peopleUnit}
              </div>
              {isMine ? (
                <button className="meet-btn delete" onClick={() => onDelete(m.id)}>
                  {t('meet.delete')}
                </button>
              ) : (
                <button
                  className={`meet-btn ${isJoined ? 'joined' : ''}`}
                  onClick={() => onJoinToggle(m.id)}
                >
                  {isJoined ? t('meet.joined') : t('meet.join')}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

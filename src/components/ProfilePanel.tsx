'use client';

import { useState } from 'react';
import { useApp } from './AppProvider';
import { formatPrice } from '@/lib/i18n';
import type { Course, Crew, Meet } from '@/lib/database.types';
import type { MarketItemWithMeta } from '@/lib/hooks/useMarket';

type Tab = 'liked' | 'saved' | 'crews' | 'meets' | 'market';

type Props = {
  courses: Course[];
  likedIds: Set<number>;
  savedIds: Set<number>;
  crews: Crew[];
  joinedCrewIds: Set<number>;
  meets: Meet[];
  marketItems: MarketItemWithMeta[];
  onEditProfile: () => void;
  /** 홈 통합 모드: 프로필 카드+통계만 표시, 탭 숨김 */
  compact?: boolean;
};

function calcDday(dateStr: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr); target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function ProfilePanel({ courses, likedIds, savedIds, crews, joinedCrewIds, meets, marketItems, onEditProfile, compact = false }: Props) {
  const { t, lang, sessionId, profile } = useApp();
  const [tab, setTab] = useState<Tab>('liked');

  const displayNick = profile.nickname === '익명러너'
    ? t('my.nick.default')
    : profile.nickname;

  const myMeets = meets.filter(m => m.creator_session === sessionId);
  const myMarketItems = marketItems.filter(i => i.creator_session === sessionId);
  const myCrewsIds = new Set([...joinedCrewIds]);
  crews.forEach(c => { if (c.creator_session === sessionId) myCrewsIds.add(c.id); });

  const levelMap: Record<string, string> = {
    '초급': t('level.beginner'), '초중급': t('level.beginner-int'),
    '중급': t('level.intermediate'), '중상급': t('level.intermediate-adv'),
    '상급': t('level.advanced'),
  };
  const statusMap: Record<string, string> = {
    '판매중': t('market.status.selling'),
    '예약중': t('market.status.reserved'),
    '판매완료': t('market.status.sold'),
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'liked', label: t('my.tab.liked') },
    { key: 'saved', label: t('my.tab.saved') },
    { key: 'crews', label: t('my.tab.crews') },
    { key: 'meets', label: t('my.tab.meets') },
    { key: 'market', label: t('my.tab.market') },
  ];

  const profileCard = (
    <div className="profile-card">
      <div className="profile-avatar" style={{ background: profile.color }}>
        {displayNick.charAt(0) || 'R'}
      </div>
      <div className="profile-info">
        <h2>{displayNick}</h2>
        <div className="profile-sid">{t('my.session')}{sessionId.slice(0, 12)}</div>
        <button className="profile-edit" onClick={onEditProfile}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
          </svg>
          {t('my.edit')}
        </button>
      </div>
    </div>
  );

  const statsBar = (
    <div className="profile-stats">
      <div className="profile-stat">
        <div className="n serif">{likedIds.size}</div>
        <div className="l">{t('my.stat.liked')}</div>
      </div>
      <div className="profile-stat">
        <div className="n serif">{myCrewsIds.size}</div>
        <div className="l">{t('my.stat.crews')}</div>
      </div>
      <div className="profile-stat">
        <div className="n serif">{myMeets.length}</div>
        <div className="l">{t('my.stat.meets')}</div>
      </div>
      <div className="profile-stat">
        <div className="n serif">{myMarketItems.length}</div>
        <div className="l">{t('my.stat.market')}</div>
      </div>
    </div>
  );

  // 홈 compact 모드: 카드 + 통계만
  if (compact) {
    return (
      <section className="section" style={{ paddingBottom: 0 }}>
        {profileCard}
        {statsBar}
      </section>
    );
  }

  const renderContent = () => {
    if (tab === 'liked' || tab === 'saved') {
      const ids = tab === 'liked' ? likedIds : savedIds;
      const items = courses.filter(c => ids.has(c.id));
      const emptyKey = tab === 'liked' ? 'liked' : 'saved';
      if (items.length === 0) {
        return (
          <div className="my-empty">
            <div className="my-empty-mark">{t(`my.empty.${emptyKey}.mark`)}</div>
            <p>{t(`my.empty.${emptyKey}.desc`)}</p>
          </div>
        );
      }
      return (
        <div className="my-list">
          {items.map(c => {
            const n = lang === 'en' ? (c.name_en || c.name) : c.name;
            const d = lang === 'en' ? (c.district_en || c.district) : c.district;
            const df = levelMap[c.difficulty || ''] || c.difficulty;
            return (
              <div key={c.id} className="my-list-item">
                <div className="ico">{c.distance_km}</div>
                <div className="main">
                  <div className="title">{n}</div>
                  <div className="sub">{d} · {df} · {c.duration_min}{t('unit.min')}</div>
                </div>
                <div className="arrow">→</div>
              </div>
            );
          })}
        </div>
      );
    }

    if (tab === 'crews') {
      const myJoined = crews.filter(c => joinedCrewIds.has(c.id));
      const myCreated = crews.filter(c => c.creator_session === sessionId && !joinedCrewIds.has(c.id));
      const items = [...myCreated, ...myJoined];
      if (items.length === 0) {
        return (
          <div className="my-empty">
            <div className="my-empty-mark">{t('my.empty.crews.mark')}</div>
            <p>{t('my.empty.crews.desc')}</p>
          </div>
        );
      }
      return (
        <div className="my-list">
          {items.map(c => {
            const isMine = c.creator_session === sessionId;
            const dday = calcDday(c.recruit_until);
            let ddayText;
            if (dday === 0) ddayText = t('crew.dday.today');
            else if (dday === 1) ddayText = t('crew.dday.tomorrow');
            else ddayText = `D-${dday}`;
            const tail = isMine
              ? `${t('my.crew.sub.recruiting')}${ddayText}`
              : t('my.crew.sub.joined');
            return (
              <div key={c.id} className="my-list-item">
                <div className="ico" style={{ background: isMine ? 'var(--coral-soft)' : 'var(--cream)', color: isMine ? 'var(--coral)' : 'var(--navy-ink)' }}>
                  {c.name.charAt(0)}
                </div>
                <div className="main">
                  <div className="title">
                    {isMine && <span style={{ color: 'var(--coral)', fontWeight: 700 }}>{t('crew.mine.badge.prefix')}</span>}
                    {isMine && ' '}{c.name}
                  </div>
                  <div className="sub">{c.area} · {c.schedule} · {tail}</div>
                </div>
                <div className="arrow">→</div>
              </div>
            );
          })}
        </div>
      );
    }

    if (tab === 'meets') {
      if (myMeets.length === 0) {
        return (
          <div className="my-empty">
            <div className="my-empty-mark">{t('my.empty.meets.mark')}</div>
            <p>{t('my.empty.meets.desc')}</p>
          </div>
        );
      }
      const peopleUnit = lang === 'ko' ? '명' : '';
      return (
        <div className="my-list">
          {myMeets.map(m => {
            const dday = calcDday(m.meet_date);
            const ddayDisplay = dday === 0 ? '●' : `D-${dday}`;
            return (
              <div key={m.id} className="my-list-item">
                <div className="ico" style={{ background: 'var(--coral-soft)', color: 'var(--coral)' }}>{ddayDisplay}</div>
                <div className="main">
                  <div className="title">{m.title}</div>
                  <div className="sub">{m.meet_date} · {m.course_name} · {m.joined}/{m.spots}{peopleUnit}</div>
                </div>
                <div className="arrow">→</div>
              </div>
            );
          })}
        </div>
      );
    }

    // market
    if (myMarketItems.length === 0) {
      return (
        <div className="my-empty">
          <div className="my-empty-mark">{t('my.empty.market.mark')}</div>
          <p>{t('my.empty.market.desc')}</p>
        </div>
      );
    }
    return (
      <div className="my-list">
        {myMarketItems.map(i => (
          <div key={i.id} className="my-list-item">
            <div className="ico">₩</div>
            <div className="main">
              <div className="title">{i.title}</div>
              <div className="sub">
                {formatPrice(i.price, lang)} · {statusMap[i.status] || i.status} · {i.likes_count} ♥ · {i.comments.length} {t('market.foot.comments')}
              </div>
            </div>
            <div className="arrow">→</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <header className="page-header">
        <div className="section-num serif">{t('my.page.num')}</div>
        <h1 className="serif">
          <span>{t('my.page.title.1')}</span>
          <em>{t('my.page.title.2')}</em>
          <span>{t('my.page.title.3')}</span>
        </h1>
        <p>{t('my.page.desc')}</p>
      </header>

      {profileCard}
      {statsBar}

      <div className="my-tabs">
        {tabs.map(tb => (
          <button
            key={tb.key}
            className={`my-tab ${tab === tb.key ? 'active' : ''}`}
            onClick={() => setTab(tb.key)}
          >{tb.label}</button>
        ))}
      </div>

      {renderContent()}
    </>
  );
}

'use client';

import { useState } from 'react';
import { useApp } from './AppProvider';
import { marketArt } from '@/lib/art';
import { formatPrice, timeAgo } from '@/lib/i18n';
import type { MarketItemWithMeta } from '@/lib/hooks/useMarket';

type Props = {
  items: MarketItemWithMeta[];
  filter: string;
  onFilterChange: (f: string) => void;
  onLike: (id: number) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: '판매중' | '예약중' | '판매완료') => void;
  onComment: (id: number, content: string) => void;
  onCommentDelete: (commentId: number) => void;
};

export function MarketGrid({ items, filter, onFilterChange, onLike, onDelete, onStatusChange, onComment, onCommentDelete }: Props) {
  const { t, lang, sessionId, showToast, profile } = useApp();
  const [openedComments, setOpenedComments] = useState<Set<number>>(new Set());
  const [statusMenuOpen, setStatusMenuOpen] = useState<number | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});

  const filtered = filter === 'all' ? items : items.filter(i => i.category === filter);

  const categoryFilters = [
    { key: 'all', label: t('filter.all'), count: items.length },
    { key: '러닝화', label: t('market.cat.shoes') },
    { key: 'GPS 워치', label: t('market.cat.watch') },
    { key: '러닝웨어', label: t('market.cat.wear') },
    { key: '액세서리', label: t('market.cat.accessory') },
    { key: '나눔/교환', label: t('market.cat.share') },
  ];

  const catDisplayMap: Record<string, string> = {
    '러닝화': t('market.cat.shoes'),
    'GPS 워치': t('market.cat.watch'),
    '러닝웨어': t('market.cat.wear'),
    '액세서리': t('market.cat.accessory'),
    '나눔/교환': t('market.cat.share'),
  };
  const statusDisplayMap: Record<string, string> = {
    '판매중': t('market.status.selling'),
    '예약중': t('market.status.reserved'),
    '판매완료': t('market.status.sold'),
  };

  const toggleComments = (id: number) => {
    setOpenedComments(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submitComment = (id: number) => {
    const text = (commentInputs[id] || '').trim();
    if (!text) { showToast(t('market.comment.empty.warn')); return; }
    onComment(id, text);
    setCommentInputs(prev => ({ ...prev, [id]: '' }));
    setOpenedComments(prev => { const n = new Set(prev); n.add(id); return n; });
    showToast(t('market.comment.added'));
  };

  return (
    <>
      <div className="market-toolbar">
        <div className="filters" style={{ marginBottom: 0 }}>
          {categoryFilters.map(f => (
            <button
              key={f.key}
              className={`chip ${filter === f.key ? 'active' : ''}`}
              onClick={() => onFilterChange(f.key)}
            >
              {f.label}
              {f.count !== undefined && <span className="count">{f.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="my-empty" style={{ gridColumn: '1 / -1' }}>
          <div className="my-empty-mark">{t('market.empty.mark')}</div>
          <p>{t('market.empty.desc')}</p>
        </div>
      ) : (
        <div className="market-grid">
          {filtered.map(item => {
            const isMine = item.creator_session === sessionId;
            const isFree = item.category === '나눔/교환' || item.price === 0;
            const isOpen = openedComments.has(item.id);
            const statusClass = item.status === '판매중' ? 'selling' : item.status === '예약중' ? 'reserved' : 'sold';

            return (
              <article key={item.id} className="market-card">
                <div className="market-media">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="market-media-art" dangerouslySetInnerHTML={{ __html: marketArt(item.category, item.id) }} />
                  )}
                  <span className={`market-status ${statusClass}`}>{statusDisplayMap[item.status]}</span>
                  {isMine && <span className="market-mine">{t('market.mine')}</span>}
                </div>
                <div className="market-body">
                  <div className="market-cat">{catDisplayMap[item.category]}{isFree ? t('market.share.suffix') : ''}</div>
                  <h3 className="market-title">{item.title}</h3>
                  <div className={`market-price ${isFree ? 'free' : ''}`}>{formatPrice(item.price, lang)}</div>
                  <div className="market-meta">
                    <span>{item.location}</span>
                    <span className="dot" />
                    <span>{timeAgo(item.created_at, lang)}</span>
                    <span className="dot" />
                    <span>{item.seller_nick}</span>
                  </div>
                </div>
                <div className="market-foot">
                  <button className={`foot-btn ${item.is_liked ? 'liked' : ''}`} onClick={() => onLike(item.id)}>
                    <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    {item.likes_count}
                  </button>
                  <button className={`foot-btn ${isOpen ? 'active' : ''}`} onClick={() => toggleComments(item.id)}>
                    <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    {t('market.foot.comments')} {item.comments.length}
                  </button>
                  {isMine && (
                    <div className={`status-menu ${statusMenuOpen === item.id ? 'open' : ''}`}>
                      <button className="foot-btn status-toggle" onClick={() => setStatusMenuOpen(statusMenuOpen === item.id ? null : item.id)}>
                        {t('market.foot.status')}{statusDisplayMap[item.status]}
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                      </button>
                      <div className="status-menu-list">
                        {(['판매중', '예약중', '판매완료'] as const).map(s => (
                          <button
                            key={s}
                            className={item.status === s ? 'current' : ''}
                            onClick={() => {
                              onStatusChange(item.id, s);
                              setStatusMenuOpen(null);
                              showToast(`${t('market.foot.status')}${statusDisplayMap[s]}`);
                            }}
                          >{statusDisplayMap[s]}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {isMine && (
                    <button className="foot-btn delete" onClick={() => onDelete(item.id)}>{t('market.foot.delete')}</button>
                  )}
                </div>
                <div className={`market-comments ${isOpen ? 'open' : ''}`}>
                  <div className="comment-list">
                    {item.comments.length === 0 ? (
                      <div className="comment-empty">{t('market.comment.empty')}</div>
                    ) : (
                      item.comments.map(c => {
                        const isMyComment = c.session_id === sessionId;
                        const displayNick = isMyComment ? profile.nickname : c.author_nick;
                        return (
                          <div key={c.id} className="comment-item">
                            <div className="comment-avatar" style={{ background: c.author_color || 'var(--navy)' }}>
                              {(displayNick || '?').charAt(0)}
                            </div>
                            <div className="comment-body">
                              <div className="comment-head">
                                <span className="comment-name">{displayNick}</span>
                                {c.is_seller_reply && <span className="comment-seller-tag">{t('market.comment.seller')}</span>}
                                {isMyComment && !c.is_seller_reply && <span className="comment-mine-tag">{t('market.comment.me')}</span>}
                                <span className="comment-time">{timeAgo(c.created_at, lang)}</span>
                                {isMyComment && (
                                  <button className="comment-del" onClick={() => { onCommentDelete(c.id); showToast(t('market.comment.deleted')); }}>
                                    {t('market.comment.del')}
                                  </button>
                                )}
                              </div>
                              <div className="comment-text">{c.content}</div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="comment-compose">
                    <input
                      type="text"
                      value={commentInputs[item.id] || ''}
                      onChange={e => setCommentInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submitComment(item.id); } }}
                      placeholder={t('market.comment.placeholder')}
                      maxLength={200}
                    />
                    <button onClick={() => submitComment(item.id)}>{t('market.comment.send')}</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

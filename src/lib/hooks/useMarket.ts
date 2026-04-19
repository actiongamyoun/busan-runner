'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { removeImageByUrl } from '@/lib/image-upload';
import type { MarketItem, MarketComment } from '@/lib/database.types';

export type MarketItemWithMeta = MarketItem & {
  likes_count: number;
  comments: MarketComment[];
  is_liked: boolean;
};

export function useMarket(sessionId: string) {
  const [items, setItems] = useState<MarketItemWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      setLoading(true);
      // 상품 + 좋아요 + 댓글 한 번에
      const { data: itemsData } = await supabase
        .from('market_items')
        .select('*')
        .order('created_at', { ascending: false });
      const itemList = (itemsData || []) as MarketItem[];
      if (itemList.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }
      const itemIds = itemList.map(i => i.id);

      const [{ data: likes }, { data: comments }] = await Promise.all([
        supabase.from('market_likes').select('item_id, session_id').in('item_id', itemIds),
        supabase.from('market_comments').select('*').in('item_id', itemIds).order('created_at', { ascending: true }),
      ]);

      // 상품별 집계
      const likesMap: Record<number, { count: number; mine: boolean }> = {};
      (likes || []).forEach((l: any) => {
        if (!likesMap[l.item_id]) likesMap[l.item_id] = { count: 0, mine: false };
        likesMap[l.item_id].count++;
        if (l.session_id === sessionId) likesMap[l.item_id].mine = true;
      });
      const commentsMap: Record<number, MarketComment[]> = {};
      (comments || []).forEach((c: any) => {
        if (!commentsMap[c.item_id]) commentsMap[c.item_id] = [];
        commentsMap[c.item_id].push(c as MarketComment);
      });

      const enriched: MarketItemWithMeta[] = itemList.map(it => ({
        ...it,
        likes_count: likesMap[it.id]?.count || 0,
        is_liked: likesMap[it.id]?.mine || false,
        comments: commentsMap[it.id] || [],
      }));
      setItems(enriched);
      setLoading(false);
    })();
  }, [sessionId, refreshKey]);

  const create = useCallback(async (input: {
    title: string; category: string; price: number;
    condition: string; location: string; description: string;
    image_url: string | null;
    seller_nick: string; seller_color: string;
  }) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('market_items')
      .insert({
        creator_session: sessionId,
        seller_nick: input.seller_nick,
        seller_color: input.seller_color,
        title: input.title,
        category: input.category,
        price: input.price,
        condition: input.condition,
        location: input.location,
        description: input.description,
        image_url: input.image_url,
        status: '판매중',
      }).select().single();
    if (error) throw error;
    refresh();
    return data;
  }, [sessionId, refresh]);

  const remove = useCallback(async (itemId: number) => {
    const supabase = createClient();
    const item = items.find(i => i.id === itemId);
    if (!item || item.creator_session !== sessionId) return;
    if (item.image_url) {
      try { await removeImageByUrl('market', item.image_url); } catch {}
    }
    await supabase.from('market_items').delete()
      .eq('id', itemId).eq('creator_session', sessionId);
    refresh();
  }, [items, sessionId, refresh]);

  const toggleLike = useCallback(async (itemId: number) => {
    const supabase = createClient();
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    if (item.is_liked) {
      await supabase.from('market_likes').delete()
        .eq('item_id', itemId).eq('session_id', sessionId);
    } else {
      await supabase.from('market_likes').insert({ item_id: itemId, session_id: sessionId });
    }
    refresh();
  }, [items, sessionId, refresh]);

  const updateStatus = useCallback(async (itemId: number, status: '판매중' | '예약중' | '판매완료') => {
    const supabase = createClient();
    await supabase.from('market_items').update({ status })
      .eq('id', itemId).eq('creator_session', sessionId);
    refresh();
  }, [sessionId, refresh]);

  const addComment = useCallback(async (itemId: number, content: string, authorNick: string, authorColor: string) => {
    const supabase = createClient();
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    const isSellerReply = item.creator_session === sessionId;
    await supabase.from('market_comments').insert({
      item_id: itemId,
      session_id: sessionId,
      author_nick: authorNick,
      author_color: authorColor,
      content,
      is_seller_reply: isSellerReply,
    });
    refresh();
  }, [items, sessionId, refresh]);

  const deleteComment = useCallback(async (commentId: number) => {
    const supabase = createClient();
    await supabase.from('market_comments').delete()
      .eq('id', commentId).eq('session_id', sessionId);
    refresh();
  }, [sessionId, refresh]);

  return { items, loading, create, remove, toggleLike, updateStatus, addComment, deleteComment };
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Meet } from '@/lib/database.types';

export function useMeets(sessionId: string) {
  const [meets, setMeets] = useState<Meet[]>([]);
  const [joinedIds, setJoinedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      setLoading(true);
      // 미래 날짜만, 날짜순
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from('meets')
        .select('*')
        .gte('meet_date', today)
        .order('meet_date', { ascending: true })
        .order('meet_time', { ascending: true });
      setMeets((data || []) as Meet[]);

      if (sessionId) {
        const { data: joins } = await supabase
          .from('meet_joins')
          .select('meet_id')
          .eq('session_id', sessionId);
        setJoinedIds(new Set((joins || []).map((r: any) => r.meet_id)));
      }
      setLoading(false);
    })();
  }, [sessionId, refreshKey]);

  const create = useCallback(async (input: {
    title: string;
    meet_date: string;
    meet_time: string;
    course_id: number;
    course_name: string;
    spots: number;
    memo: string;
  }) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('meets')
      .insert({
        creator_session: sessionId,
        title: input.title,
        meet_date: input.meet_date,
        meet_time: input.meet_time,
        course_id: input.course_id,
        course_name: input.course_name,
        spots: input.spots,
        joined: 1,
        memo: input.memo || null,
      })
      .select()
      .single();
    if (error) throw error;
    refresh();
    return data;
  }, [sessionId, refresh]);

  const remove = useCallback(async (meetId: number) => {
    const supabase = createClient();
    const meet = meets.find(m => m.id === meetId);
    if (!meet || meet.creator_session !== sessionId) return;
    await supabase.from('meets').delete().eq('id', meetId).eq('creator_session', sessionId);
    refresh();
  }, [meets, sessionId, refresh]);

  const toggleJoin = useCallback(async (meetId: number): Promise<'joined' | 'left' | 'full'> => {
    const supabase = createClient();
    const meet = meets.find(m => m.id === meetId);
    if (!meet) return 'left';
    if (joinedIds.has(meetId)) {
      await supabase.from('meet_joins').delete()
        .eq('meet_id', meetId).eq('session_id', sessionId);
      await supabase.from('meets').update({ joined: Math.max(1, meet.joined - 1) }).eq('id', meetId);
      refresh();
      return 'left';
    } else {
      if (meet.joined >= meet.spots) return 'full';
      await supabase.from('meet_joins').insert({ meet_id: meetId, session_id: sessionId });
      await supabase.from('meets').update({ joined: meet.joined + 1 }).eq('id', meetId);
      refresh();
      return 'joined';
    }
  }, [meets, joinedIds, sessionId, refresh]);

  return { meets, joinedIds, loading, create, remove, toggleJoin, refresh };
}

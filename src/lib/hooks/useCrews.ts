'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { removeImageByUrl } from '@/lib/image-upload';
import type { Crew, CrewJoin } from '@/lib/database.types';

export function useCrews(sessionId: string) {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [joinedIds, setJoinedIds] = useState<Set<number>>(new Set());
  const [myApplicants, setMyApplicants] = useState<Record<number, CrewJoin[]>>({});
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      setLoading(true);
      const today = new Date().toISOString().slice(0, 10);
      const { data: crewData } = await supabase
        .from('crews')
        .select('*')
        .gte('recruit_until', today)
        .order('created_at', { ascending: false });
      const list = (crewData || []) as Crew[];
      setCrews(list);

      if (sessionId) {
        const { data: joins } = await supabase
          .from('crew_joins')
          .select('crew_id')
          .eq('session_id', sessionId);
        setJoinedIds(new Set((joins || []).map((r: any) => r.crew_id)));

        // 내가 만든 크루의 신청자 목록
        const myCrewIds = list.filter(c => c.creator_session === sessionId).map(c => c.id);
        if (myCrewIds.length > 0) {
          const { data: apps } = await supabase
            .from('crew_joins')
            .select('*')
            .in('crew_id', myCrewIds);
          const grouped: Record<number, CrewJoin[]> = {};
          (apps || []).forEach((a: any) => {
            if (!grouped[a.crew_id]) grouped[a.crew_id] = [];
            grouped[a.crew_id].push(a as CrewJoin);
          });
          setMyApplicants(grouped);
        }
      }
      setLoading(false);
    })();
  }, [sessionId, refreshKey]);

  const create = useCallback(async (input: {
    name: string; area: string; level: string; schedule: string; pace: string;
    description: string; photo_url: string | null; theme: string;
    member_limit: number; recruit_until: string;
    host_nick: string; host_color: string;
  }) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('crews')
      .insert({
        creator_session: sessionId,
        host_nick: input.host_nick,
        host_color: input.host_color,
        name: input.name,
        area: input.area,
        level: input.level,
        schedule: input.schedule,
        pace: input.pace,
        description: input.description,
        photo_url: input.photo_url,
        theme: input.theme,
        member_limit: input.member_limit,
        joined: 1,
        recruit_until: input.recruit_until,
      })
      .select().single();
    if (error) throw error;
    refresh();
    return data;
  }, [sessionId, refresh]);

  const remove = useCallback(async (crewId: number) => {
    const supabase = createClient();
    const crew = crews.find(c => c.id === crewId);
    if (!crew || crew.creator_session !== sessionId) return;
    // 사진도 삭제
    if (crew.photo_url) {
      try { await removeImageByUrl('crews', crew.photo_url); } catch {}
    }
    await supabase.from('crews').delete().eq('id', crewId).eq('creator_session', sessionId);
    refresh();
  }, [crews, sessionId, refresh]);

  const join = useCallback(async (crewId: number, greeting: string, nickname: string, color: string): Promise<'joined' | 'full'> => {
    const supabase = createClient();
    const crew = crews.find(c => c.id === crewId);
    if (!crew) return 'full';
    if (crew.joined >= crew.member_limit) return 'full';

    await supabase.from('crew_joins').insert({
      crew_id: crewId,
      session_id: sessionId,
      nickname,
      color,
      greeting,
    });
    await supabase.from('crews').update({ joined: crew.joined + 1 }).eq('id', crewId);
    refresh();
    return 'joined';
  }, [crews, sessionId, refresh]);

  const leave = useCallback(async (crewId: number) => {
    const supabase = createClient();
    const crew = crews.find(c => c.id === crewId);
    if (!crew) return;
    await supabase.from('crew_joins').delete()
      .eq('crew_id', crewId).eq('session_id', sessionId);
    await supabase.from('crews').update({ joined: Math.max(1, crew.joined - 1) }).eq('id', crewId);
    refresh();
  }, [crews, sessionId, refresh]);

  return { crews, joinedIds, myApplicants, loading, create, remove, join, leave, refresh };
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Course } from '@/lib/database.types';

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('id', { ascending: true });
      if (error) setError(error.message);
      else setCourses((data || []) as Course[]);
      setLoading(false);
    })();
  }, []);

  return { courses, loading, error };
}

// 내가 좋아요한 코스 id Set
export function useCourseLikes(sessionId: string) {
  const [likes, setLikes] = useState<Set<number>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!sessionId) return;
    const supabase = createClient();
    (async () => {
      const { data } = await supabase
        .from('course_likes')
        .select('course_id')
        .eq('session_id', sessionId);
      setLikes(new Set((data || []).map((r: any) => r.course_id)));
    })();
  }, [sessionId, refreshKey]);

  const toggle = useCallback(async (courseId: number) => {
    if (!sessionId) return;
    const supabase = createClient();
    const isLiked = likes.has(courseId);
    if (isLiked) {
      await supabase.from('course_likes').delete()
        .eq('course_id', courseId).eq('session_id', sessionId);
      setLikes(prev => { const n = new Set(prev); n.delete(courseId); return n; });
    } else {
      await supabase.from('course_likes').insert({ course_id: courseId, session_id: sessionId });
      setLikes(prev => { const n = new Set(prev); n.add(courseId); return n; });
    }
  }, [sessionId, likes]);

  return { likes, toggle, refresh: () => setRefreshKey(k => k + 1) };
}

// 내가 저장한 코스 id Set
export function useCourseSaves(sessionId: string) {
  const [saves, setSaves] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!sessionId) return;
    const supabase = createClient();
    (async () => {
      const { data } = await supabase
        .from('course_saves')
        .select('course_id')
        .eq('session_id', sessionId);
      setSaves(new Set((data || []).map((r: any) => r.course_id)));
    })();
  }, [sessionId]);

  const toggle = useCallback(async (courseId: number) => {
    if (!sessionId) return false;
    const supabase = createClient();
    const isSaved = saves.has(courseId);
    if (isSaved) {
      await supabase.from('course_saves').delete()
        .eq('course_id', courseId).eq('session_id', sessionId);
      setSaves(prev => { const n = new Set(prev); n.delete(courseId); return n; });
      return false;
    } else {
      await supabase.from('course_saves').insert({ course_id: courseId, session_id: sessionId });
      setSaves(prev => { const n = new Set(prev); n.add(courseId); return n; });
      return true;
    }
  }, [sessionId, saves]);

  return { saves, toggle };
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

// 닉네임 중복 체크
export async function isNicknameTaken(nickname: string, currentSessionId: string): Promise<boolean> {
  if (!nickname.trim()) return false;
  const supabase = createClient();
  const { data } = await supabase
    .from('profiles')
    .select('session_id')
    .eq('nickname', nickname);
  if (!data || data.length === 0) return false;
  // 내 기존 프로필이면 사용 가능
  return !data.every((r: any) => r.session_id === currentSessionId);
}

// 프로필 저장/업데이트
export async function saveProfileToDb(sessionId: string, nickname: string, color: string) {
  const supabase = createClient();
  // upsert
  const { error } = await supabase
    .from('profiles')
    .upsert({
      session_id: sessionId,
      nickname,
      color,
      icon: nickname.charAt(0),
    }, { onConflict: 'session_id' });
  if (error) throw error;
}

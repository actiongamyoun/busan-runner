import { createClient } from '@/lib/supabase/client';
import { t, type Lang } from '@/lib/i18n';

// 이미지 파일 검증 (용량/포맷/크기)
export function validateImage(file: File, lang: Lang = 'ko'): Promise<void> {
  return new Promise((resolve, reject) => {
    if (file.size > 2 * 1024 * 1024) {
      return reject(new Error(t('img.err.size', lang)));
    }
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      return reject(new Error(t('img.err.type', lang)));
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = (e.target?.result as string) || '';
      const img = new Image();
      img.onload = () => {
        if (img.width < 400 || img.height < 400) {
          return reject(new Error(t('img.err.dimension', lang)));
        }
        resolve();
      };
      img.onerror = () => reject(new Error(t('img.err.decode', lang)));
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error(t('img.err.read', lang)));
    reader.readAsDataURL(file);
  });
}

// 파일 → base64 (모달 미리보기용)
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || '');
    reader.onerror = () => reject(new Error('Read failed'));
    reader.readAsDataURL(file);
  });
}

// Supabase Storage에 업로드 → public URL 반환
export async function uploadImage(
  bucket: 'crews' | 'market' | 'courses',
  file: File,
  sessionId: string
): Promise<string> {
  const supabase = createClient();
  // 파일명: {session_prefix}_{timestamp}_{random}.{ext}
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${sessionId.slice(0, 8)}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });
  if (error) throw error;

  // public URL 가져오기
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return urlData.publicUrl;
}

// Storage에서 파일 제거 (URL 기반)
export async function removeImageByUrl(bucket: 'crews' | 'market' | 'courses', url: string) {
  if (!url) return;
  const supabase = createClient();
  // URL 패턴: .../storage/v1/object/public/{bucket}/{path}
  const prefix = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(prefix);
  if (idx < 0) return;
  const path = url.slice(idx + prefix.length);
  await supabase.storage.from(bucket).remove([path]);
}

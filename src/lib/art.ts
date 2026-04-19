import type { Course } from './database.types';

// 코스 타입별 SVG 일러스트 (사진 없을 때 사용)
export function courseArt(course: Course): string {
  const id = course.id;
  const colorA = course.color_primary || '#FF9A7B';
  const colorB = course.color_light || '#4A90E2';
  const type = course.course_type;

  if (type === '해변') {
    return `
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="bg${id}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="${colorA}"/>
            <stop offset="1" stop-color="${colorB}"/>
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#bg${id})"/>
        <circle cx="310" cy="80" r="40" fill="#FFF4E6" opacity="0.85"/>
        <path d="M0 180 L80 140 L140 160 L200 130 L260 150 L340 125 L400 145 L400 200 L0 200 Z" fill="rgba(27,58,92,0.25)"/>
        <path d="M0 220 Q200 210 400 225 L400 300 L0 300 Z" fill="#F5E6D3"/>
        <path d="M0 215 Q50 210 100 215 T200 215 T300 215 T400 215" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" fill="none"/>
        <path d="M0 225 Q60 220 120 225 T240 225 T360 225 T400 225" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" fill="none"/>
        <path d="M40 260 Q150 240 260 255 T380 245" stroke="#FFF" stroke-width="2.5" fill="none" stroke-dasharray="5 5" opacity="0.9"/>
        <circle cx="40" cy="260" r="4" fill="#FF6B4A"/>
        <circle cx="380" cy="245" r="4" fill="#FF6B4A"/>
      </svg>
    `;
  }
  return `
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="bg${id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${colorA}"/>
          <stop offset="1" stop-color="${colorB}"/>
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#bg${id})"/>
      <g fill="rgba(27,58,92,0.3)">
        <circle cx="40" cy="160" r="20"/><rect x="37" y="160" width="6" height="30"/>
        <circle cx="90" cy="150" r="25"/><rect x="87" y="150" width="6" height="40"/>
        <circle cx="340" cy="155" r="22"/><rect x="337" y="155" width="6" height="35"/>
        <circle cx="380" cy="165" r="18"/><rect x="377" y="165" width="6" height="25"/>
      </g>
      <path d="M0 210 Q100 195 200 205 T400 200 L400 300 L0 300 Z" fill="rgba(74,144,226,0.4)"/>
      <path d="M0 220 Q100 205 200 215 T400 210 L400 300 L0 300 Z" fill="rgba(74,144,226,0.5)"/>
      <path d="M20 250 Q200 240 380 255" stroke="#FFF" stroke-width="2.5" fill="none" stroke-dasharray="5 5" opacity="0.9"/>
      <circle cx="20" cy="250" r="4" fill="#FF6B4A"/>
      <circle cx="380" cy="255" r="4" fill="#FF6B4A"/>
      <path d="M250 60 q5 -5 10 0 q5 -5 10 0" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" fill="none"/>
    </svg>
  `;
}

// 크루 카드 테마 일러스트
export function crewHeroArt(theme: string | null, id: number | string): string {
  const palettes: Record<string, { a: string; b: string }> = {
    sunrise: { a: '#FF6B4A', b: '#1B3A5C' },
    night:   { a: '#0F2340', b: '#4A90E2' },
    river:   { a: '#2ECC71', b: '#1ABC9C' },
    cliff:   { a: '#1B3A5C', b: '#9B59B6' },
  };
  const { a, b } = palettes[theme || 'sunrise'] || palettes.sunrise;
  const gradId = `crewGrad${id}`;

  const themes: Record<string, string> = {
    sunrise: `
      <circle cx="260" cy="90" r="42" fill="rgba(255,255,255,0.3)"/>
      <circle cx="260" cy="90" r="28" fill="rgba(255,255,255,0.6)"/>
      <path d="M0 170 Q100 155 200 165 T400 160 L400 250 L0 250 Z" fill="rgba(27,58,92,0.35)"/>
      <path d="M0 190 Q80 180 160 188 T320 185 T400 180 L400 250 L0 250 Z" fill="rgba(27,58,92,0.5)"/>
      <path d="M0 205 Q60 200 120 205 T240 205 T360 205 T400 205" stroke="rgba(255,255,255,0.55)" stroke-width="1.5" fill="none"/>
    `,
    night: `
      <circle cx="320" cy="60" r="4" fill="rgba(255,255,255,0.9)"/>
      <circle cx="180" cy="70" r="2.5" fill="rgba(255,255,255,0.8)"/>
      <path d="M0 150 L80 150 L100 120 L120 120 L140 150 L220 150 L240 120 L260 120 L280 150 L400 150" stroke="rgba(255,255,255,0.65)" stroke-width="1.5" fill="none"/>
      <circle cx="110" cy="125" r="2.5" fill="#FFD23F"/>
      <circle cx="250" cy="125" r="2.5" fill="#FFD23F"/>
      <path d="M0 170 Q200 165 400 170 L400 250 L0 250 Z" fill="rgba(27,58,92,0.6)"/>
    `,
    river: `
      <g fill="rgba(27,58,92,0.35)">
        <circle cx="55" cy="155" r="12"/><rect x="53" y="155" width="4" height="18"/>
        <circle cx="120" cy="160" r="10"/><rect x="118" y="160" width="4" height="16"/>
        <circle cx="340" cy="155" r="12"/><rect x="338" y="155" width="4" height="18"/>
      </g>
      <path d="M0 200 Q100 190 200 200 T400 195 L400 250 L0 250 Z" fill="rgba(26,188,156,0.5)"/>
      <path d="M0 215 Q100 210 200 215 T400 212 L400 250 L0 250 Z" fill="rgba(26,188,156,0.7)"/>
      <path d="M20 195 Q200 180 380 200" stroke="rgba(255,255,255,0.7)" stroke-width="2" fill="none" stroke-dasharray="5 5"/>
    `,
    cliff: `
      <path d="M0 180 L60 120 L110 140 L150 100 L200 130 L260 90 L310 120 L360 80 L400 110 L400 250 L0 250 Z" fill="rgba(15,28,50,0.55)"/>
      <path d="M0 210 L50 170 L100 185 L160 160 L220 180 L280 155 L340 175 L400 165 L400 250 L0 250 Z" fill="rgba(15,28,50,0.75)"/>
      <circle cx="320" cy="75" r="3" fill="#FFD23F" opacity="0.8"/>
    `,
  };

  return `
    <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${a}"/>
          <stop offset="1" stop-color="${b}"/>
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#${gradId})"/>
      ${themes[theme || 'sunrise'] || themes.sunrise}
    </svg>
  `;
}

// 장터 카드 일러스트 (사진 없을 때 카테고리별 아이콘)
export function marketArt(category: string, id: number | string): string {
  const palettes: Record<string, { a: string; b: string }> = {
    '러닝화':    { a: '#FF6B4A', b: '#1B3A5C' },
    'GPS 워치':  { a: '#1B3A5C', b: '#4A90E2' },
    '러닝웨어':   { a: '#FF9A7B', b: '#FFD23F' },
    '액세서리':   { a: '#2ECC71', b: '#1ABC9C' },
    '나눔/교환':  { a: '#9B59B6', b: '#FF6B4A' },
  };
  const { a, b } = palettes[category] || palettes['러닝화'];
  const gid = `mkt${id}`;

  const icons: Record<string, string> = {
    '러닝화': '<path d="M80 170 L140 150 L180 140 L220 145 L260 155 L310 170 L320 195 L80 195 Z" fill="rgba(255,255,255,0.92)"/><path d="M100 175 Q110 165 120 175 M140 170 Q150 160 160 170 M180 170 Q190 160 200 170 M220 175 Q230 165 240 175 M260 180 Q270 170 280 180" stroke="rgba(27,58,92,0.4)" stroke-width="2" fill="none"/>',
    'GPS 워치': '<rect x="160" y="90" width="80" height="90" rx="14" fill="rgba(255,255,255,0.92)"/><rect x="175" y="105" width="50" height="55" rx="6" fill="rgba(27,58,92,0.85)"/><text x="200" y="135" text-anchor="middle" font-family="Fraunces, serif" font-size="14" font-weight="600" fill="#FF6B4A">5.2</text><text x="200" y="150" text-anchor="middle" font-size="8" fill="rgba(255,255,255,0.7)">KM</text>',
    '러닝웨어': '<path d="M140 90 L180 90 L180 100 L220 100 L220 90 L260 90 L275 130 L255 145 L255 210 L145 210 L145 145 L125 130 Z" fill="rgba(255,255,255,0.92)"/>',
    '액세서리': '<circle cx="200" cy="130" r="45" fill="none" stroke="rgba(255,255,255,0.92)" stroke-width="6"/><circle cx="200" cy="130" r="30" fill="rgba(255,255,255,0.4)"/>',
    '나눔/교환': '<path d="M160 120 L240 120 L230 110 M240 120 L230 130" stroke="rgba(255,255,255,0.92)" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M240 160 L160 160 L170 150 M160 160 L170 170" stroke="rgba(255,255,255,0.92)" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  };

  return `
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${a}"/>
          <stop offset="1" stop-color="${b}"/>
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill="url(#${gid})"/>
      ${icons[category] || icons['러닝화']}
    </svg>
  `;
}

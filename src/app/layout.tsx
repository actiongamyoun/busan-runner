import '@/styles/globals.css';
import type { Metadata, Viewport } from 'next';
import { AppProvider } from '@/components/AppProvider';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';

export const metadata: Metadata = {
  title: '부산러너 · Busan Runner',
  description: '부산의 모든 러닝 경험을 하나로. Routes, crews, and gear for runners in Busan.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '부산러너',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#FF6B4A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* 폰트 도메인 미리 연결 (성능 최적화) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />

        {/* Pretendard (한글) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.css"
        />

        {/* Fraunces (영문 세리프) */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&display=swap"
        />

        {/* Material Symbols Rounded */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,300..700,0..1,-25..200&display=block"
        />
      </head>
      <body>
        <AppProvider>
          <TopBar />
          <main className="page">{children}</main>
          <BottomNav />
          <div className="side-mark">Run · Busan · Since 2026</div>
        </AppProvider>
      </body>
    </html>
  );
}

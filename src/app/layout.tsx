import '@/styles/globals.css';
import type { Metadata, Viewport } from 'next';
import { AppProvider } from '@/components/AppProvider';
import { TopBar } from '@/components/TopBar';
import { BottomNav } from '@/components/BottomNav';

export const metadata: Metadata = {
  title: '부산러너 · Busan Runner',
  description: '부산의 모든 러닝 경험을 하나로. Routes, crews, and gear for runners in Busan.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FF6B4A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
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

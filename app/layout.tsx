import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ruthy Fun Mandarin｜一起快樂學中文',
  description: 'Ruthy Fun Mandarin：用生活、故事和文化，輕鬆學會真正用得到的華語。',
  icons: { icon: '/favicon.svg' }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <head>
        <meta name="theme-color" content="#6d4aff" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Noto+Sans+TC:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <Script src="/content.js" strategy="afterInteractive" />
        <Script src="/app.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}

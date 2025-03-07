/**
 * Root layout component
 * 
 * This is the main layout wrapper for the entire application
 * It includes global providers and styles
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers';

// Import Inter font with Latin subset
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Metadata for SEO
export const metadata: Metadata = {
  title: 'Dịch vụ Công - Cổng thông tin dịch vụ công trực tuyến',
  description: 'Cổng thông tin dịch vụ công trực tuyến - Nơi cung cấp các dịch vụ hành chính công cho người dân và doanh nghiệp',
  keywords: 'dịch vụ công, hành chính công, chính phủ, thủ tục hành chính',
};

/**
 * Root layout component
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

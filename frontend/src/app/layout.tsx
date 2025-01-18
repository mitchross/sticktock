import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title:
    "StickTock | Share TikToks Safely. No Ads, No Spying, No Phone App.",
  description:
    "StickTock",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Add here header stuff, specific to your own installation */}
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}

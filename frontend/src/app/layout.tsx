import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { BASE_DOMAIN } from '../../service.config';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title:
    "StickTock | Watch TikToks Safely",
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
        <script defer data-domain={BASE_DOMAIN} src="https://privacysafe.click/js/script.js"></script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}

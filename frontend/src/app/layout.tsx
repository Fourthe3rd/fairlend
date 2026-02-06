import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FairLend - Undercollateralized Lending Powered by Reputation',
  description: 'Borrow crypto with less collateral using your on-chain reputation. Your FairScore determines your terms.',
  openGraph: {
    title: 'FairLend',
    description: 'Your on-chain reputation is your credit score',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FairLend',
    description: 'Undercollateralized lending powered by FairScore',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: 'Hacama Investments | Reliable Supply for Every Need',
    template: '%s | Hacama Investments',
  },
  description:
    'Hacama Investments is a diversified investment, procurement, and supply company in Lilongwe, Malawi — serving institutions, businesses, organizations, farmers, and communities.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

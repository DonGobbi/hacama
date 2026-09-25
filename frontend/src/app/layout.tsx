import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { DEFAULT_SETTINGS, SITE_URL } from '@/lib/company';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

const DESCRIPTION =
  'Hacama Investments is a diversified investment, procurement, and supply company in Lilongwe, Malawi — serving institutions, businesses, organizations, farmers, and communities.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Hacama Investments | Reliable Supply for Every Need',
    template: '%s | Hacama Investments',
  },
  description: DESCRIPTION,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Hacama Investments',
    title: 'Hacama Investments | Reliable Supply for Every Need',
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hacama Investments | Reliable Supply for Every Need',
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Hacama Investments',
  url: SITE_URL,
  logo: `${SITE_URL}/hacama_logo.png`,
  description: DESCRIPTION,
  telephone: DEFAULT_SETTINGS.phone,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Lilongwe',
    addressCountry: 'MW',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        {children}
      </body>
    </html>
  );
}

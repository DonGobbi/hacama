import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { WhatsAppButton } from '@/components/site/WhatsAppButton';
import { publicApi, safely } from '@/lib/api';
import { DEFAULT_SETTINGS } from '@/lib/company';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = { ...DEFAULT_SETTINGS, ...(await safely(publicApi.settings(), DEFAULT_SETTINGS)) };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <WhatsAppButton number={settings.whatsapp} />
    </div>
  );
}

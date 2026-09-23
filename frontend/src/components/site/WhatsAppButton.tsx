import { MessageCircle } from 'lucide-react';
import { whatsappLink } from '@/lib/company';

export function WhatsAppButton({ number }: { number: string }) {
  if (!number) return null;
  return (
    <a
      href={whatsappLink(number, 'Hello Hacama Investments, I would like to enquire about')}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-5 bottom-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/10 transition hover:bg-[#1ebe5b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
    >
      <MessageCircle className="size-5" />
      <span className="hidden sm:inline">Chat on WhatsApp</span>
    </a>
  );
}

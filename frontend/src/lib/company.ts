import type { SiteSettings } from './types';

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hacama-web-370098605562.africa-south1.run.app';

export const SUPPLY_CATEGORIES = [
  'Agriculture & Farm Supplies',
  'Education & Institutional Supplies',
  'Technology & Office Equipment',
  'Machinery & Equipment',
  'General Procurement & Supplies',
  'Business & Investment',
];

export const DEFAULT_SETTINGS: SiteSettings = {
  phone: '+265 997 20 07 00',
  whatsapp: '+265 997 20 07 00',
  email: '',
  address: '',
  officeHours: '',
  stats: [],
  credentials: [],
  faqs: [],
};

export function whatsappLink(number: string, text?: string) {
  const digits = number.replace(/\D/g, '').replace(/^0/, '265');
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

export function telLink(number: string) {
  return `tel:${number.replace(/[^\d+]/g, '')}`;
}

export function mapEmbedUrl(address: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}

import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: LucideIcon;
  title: string;
  text?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="card flex animate-fade-up flex-col items-center gap-3 p-12 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-500">
        <Icon className="size-6" />
      </span>
      <h2 className="text-lg font-semibold text-ink-950">{title}</h2>
      {text && <p className="max-w-md text-sm text-slate-600">{text}</p>}
      {action && (
        <Link href={action.href} className="btn btn-outline btn-sm mt-2">
          {action.label}
        </Link>
      )}
    </div>
  );
}

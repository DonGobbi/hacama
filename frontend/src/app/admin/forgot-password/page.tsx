import { ArrowLeft, MailCheck } from 'lucide-react';
import Link from 'next/link';
import { Brand } from '@/components/site/Brand';

// Email delivery is not live on the domain yet, so self-service password reset is paused.
// This page intentionally shows a notice instead of the reset form.
export default function ForgotPasswordPage() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-stone-50 px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,75,56,0.10),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(168,75,56,0.06),transparent_35%)]" />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Brand full />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-amber-50">
            <MailCheck className="size-6 text-amber-600" />
          </span>
          <h1 className="mt-4 text-xl font-bold text-ink-950">Password reset coming soon</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Self-service password reset is not available yet. If you can&apos;t sign in, contact the developer who set
            up this site and they will reset your password for you.
          </p>
          <Link
            href="/admin/login"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-ink-950"
          >
            <ArrowLeft className="size-4" /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

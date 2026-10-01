'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

function DialogShell({ onCancel, children }: { onCancel: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onCancel}
        className="absolute inset-0 animate-fade-in bg-ink-950/40 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-sm animate-pop rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  danger = true,
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <DialogShell onCancel={onCancel}>
      <div className="flex items-start gap-4">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-50 text-red-500">
          <AlertTriangle className="size-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink-950">{title}</h2>
          {message && <p className="mt-1 text-sm break-words text-slate-600">{message}</p>}
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" onClick={onCancel} disabled={busy} className="btn btn-outline btn-sm">
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`btn btn-sm ${danger ? 'btn-danger' : 'btn-primary'}`}
        >
          {busy && <Loader2 className="size-3.5 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </DialogShell>
  );
}

export function PromptDialog({
  open,
  title,
  label,
  placeholder,
  confirmLabel = 'Save',
  busy = false,
  onSubmit,
  onCancel,
}: {
  open: boolean;
  title: string;
  label: string;
  placeholder?: string;
  confirmLabel?: string;
  busy?: boolean;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState('');
  useEffect(() => {
    if (open) setValue('');
  }, [open]);
  if (!open) return null;
  return (
    <DialogShell onCancel={onCancel}>
      <h2 className="text-base font-semibold text-ink-950">{title}</h2>
      <form
        className="mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) onSubmit(value.trim());
        }}
      >
        <label className="block text-xs font-medium tracking-wide text-slate-500 uppercase">{label}</label>
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
        />
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={busy} className="btn btn-outline btn-sm">
            Cancel
          </button>
          <button type="submit" disabled={busy || !value.trim()} className="btn btn-primary btn-sm">
            {busy && <Loader2 className="size-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </form>
    </DialogShell>
  );
}

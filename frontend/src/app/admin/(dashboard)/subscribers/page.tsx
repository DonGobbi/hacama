'use client';

import { Loader2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ErrorNote, PageHeader } from '@/components/admin/AdminShell';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { Subscriber } from '@/lib/types';

export default function AdminSubscribersPage() {
  const [items, setItems] = useState<Subscriber[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi
      .subscribers()
      .then(setItems)
      .catch((err: Error) => setError(err.message));
  }, []);

  async function remove(sub: Subscriber) {
    if (!confirm(`Remove ${sub.email} from the list?`)) return;
    try {
      await adminApi.deleteSubscriber(sub._id);
      setItems((prev) => prev?.filter((s) => s._id !== sub._id) ?? null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <>
      <PageHeader
        title="Newsletter subscribers"
        description="Email addresses collected from the footer signup form on the website."
      />
      <ErrorNote message={error} />

      {items === null && !error && (
        <p className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="size-4 animate-spin" /> Loading...
        </p>
      )}

      {items?.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No subscribers yet. The footer signup form on the website feeds this list.
        </p>
      )}

      {items && items.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Subscribed</th>
                <th className="px-4 py-3 font-medium sr-only">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((sub) => (
                <tr key={sub._id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink-950">
                    <a href={`mailto:${sub.email}`} className="hover:text-brand-600">{sub.email}</a>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(sub.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => remove(sub)}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                      title="Remove subscriber"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-400">
            {items.length} {items.length === 1 ? 'subscriber' : 'subscribers'}
          </p>
        </div>
      )}
    </>
  );
}

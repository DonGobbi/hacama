'use client';

import { Calendar, Mail, MapPin, MessageCircle, Phone, Tag, Trash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { ErrorNote, PageHeader, StatusBadge } from '@/components/admin/AdminShell';
import { adminApi } from '@/lib/api';
import { whatsappLink } from '@/lib/company';
import { formatDate, titleCase } from '@/lib/format';
import { ENQUIRY_STATUSES, type Enquiry, type EnquiryStatus } from '@/lib/types';

function EnquiriesView() {
  const router = useRouter();
  const params = useSearchParams();
  const status = params.get('status') ?? '';
  const type = params.get('type') ?? '';

  const [items, setItems] = useState<Enquiry[] | null>(null);
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setItems(null);
    adminApi
      .enquiries({ status, type })
      .then(setItems)
      .catch((err: Error) => setError(err.message));
  }, [status, type]);

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`/admin/enquiries?${next.toString()}`);
  }

  async function update(enquiry: Enquiry, data: { status?: EnquiryStatus; notes?: string }) {
    try {
      const updated = await adminApi.updateEnquiry(enquiry._id, data);
      setItems((prev) => prev?.map((e) => (e._id === updated._id ? updated : e)) ?? null);
      setSelected(updated);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function remove(enquiry: Enquiry) {
    if (!confirm(`Delete enquiry from ${enquiry.name}?`)) return;
    try {
      await adminApi.deleteEnquiry(enquiry._id);
      setItems((prev) => prev?.filter((e) => e._id !== enquiry._id) ?? null);
      setSelected(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <>
      <PageHeader title="Enquiries" description="Contact messages and quote requests submitted on the website." />
      <ErrorNote message={error} />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <select className="input sm:w-48" value={type} onChange={(e) => setFilter('type', e.target.value)}>
          <option value="">All types</option>
          <option value="quote">Quote requests</option>
          <option value="contact">Contact messages</option>
        </select>
        <select className="input sm:w-44" value={status} onChange={(e) => setFilter('status', e.target.value)}>
          <option value="">All statuses</option>
          {ENQUIRY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {titleCase(s)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="card divide-y divide-slate-100 self-start">
          {items === null && !error && <p className="p-6 text-sm text-slate-400">Loading...</p>}
          {items?.length === 0 && <p className="p-6 text-sm text-slate-500">No enquiries found.</p>}
          {items?.map((e) => (
            <button
              key={e._id}
              type="button"
              onClick={() => setSelected(e)}
              className={`flex w-full flex-wrap items-center justify-between gap-2 px-5 py-3 text-left text-sm hover:bg-slate-50 ${selected?._id === e._id ? 'bg-brand-50' : ''}`}
            >
              <div className="min-w-0">
                <p className="font-medium text-ink-950">
                  {e.name}
                  {e.organization && <span className="font-normal text-slate-500"> · {e.organization}</span>}
                </p>
                <p className="truncate text-slate-500">
                  {e.type === 'quote'
                    ? `${e.items.length} item${e.items.length === 1 ? '' : 's'}${e.category ? ` · ${e.category}` : ''}`
                    : e.message}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{formatDate(e.createdAt)}</span>
                <StatusBadge value={e.type} />
                <StatusBadge value={e.status} />
              </div>
            </button>
          ))}
        </div>

        {selected ? (
          <aside key={selected._id} className="card space-y-4 self-start p-5 lg:sticky lg:top-6">
            <div>
              <div className="flex items-center gap-2">
                <StatusBadge value={selected.type} />
                <span className="text-xs text-slate-400">{formatDate(selected.createdAt)}</span>
              </div>
              <h2 className="mt-2 text-lg font-semibold text-ink-950">{selected.name}</h2>
              {selected.organization && <p className="text-sm text-slate-500">{selected.organization}</p>}
            </div>

            <div className="space-y-1.5 text-sm">
              <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-slate-700 hover:text-brand-600">
                <Mail className="size-4" /> {selected.email}
              </a>
              {selected.phone && (
                <>
                  <a href={`tel:${selected.phone}`} className="flex items-center gap-2 text-slate-700 hover:text-brand-600">
                    <Phone className="size-4" /> {selected.phone}
                  </a>
                  <a
                    href={whatsappLink(selected.phone, `Hello ${selected.name}, thank you for contacting Hacama Investments.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 font-medium text-emerald-700 hover:underline"
                  >
                    <MessageCircle className="size-4" /> Reply on WhatsApp
                  </a>
                </>
              )}
              {selected.category && (
                <p className="flex items-center gap-2 text-slate-700">
                  <Tag className="size-4" /> {selected.category}
                </p>
              )}
              {selected.deliveryLocation && (
                <p className="flex items-center gap-2 text-slate-700">
                  <MapPin className="size-4" /> {selected.deliveryLocation}
                </p>
              )}
              {selected.neededBy && (
                <p className="flex items-center gap-2 text-slate-700">
                  <Calendar className="size-4" /> Needed by {formatDate(selected.neededBy)}
                </p>
              )}
            </div>

            {selected.items.length > 0 && (
              <div>
                <p className="label">Requested items</p>
                <table className="w-full overflow-hidden rounded-lg text-sm">
                  <thead className="bg-slate-50 text-left text-xs text-slate-500">
                    <tr>
                      <th className="px-3 py-2 font-medium">Item</th>
                      <th className="px-3 py-2 font-medium">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selected.items.map((item, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-slate-700">{item.description}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-slate-700">{item.quantity || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selected.message && (
              <div>
                <p className="label">{selected.type === 'quote' ? 'Additional notes' : 'Message'}</p>
                <p className="max-h-60 overflow-y-auto rounded-lg bg-slate-50 p-3 text-sm whitespace-pre-line text-slate-700">
                  {selected.message}
                </p>
              </div>
            )}

            <label className="block">
              <span className="label">Status</span>
              <select
                className="input"
                value={selected.status}
                onChange={(e) => update(selected, { status: e.target.value as EnquiryStatus })}
              >
                {ENQUIRY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {titleCase(s)}
                  </option>
                ))}
              </select>
            </label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                update(selected, { notes: String(new FormData(e.currentTarget).get('notes') ?? '') });
              }}
            >
              <label className="block">
                <span className="label">Internal notes</span>
                <textarea className="input" name="notes" rows={4} defaultValue={selected.notes} />
              </label>
              <div className="mt-3 flex justify-between">
                <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(selected)}>
                  <Trash2 className="size-3.5" /> Delete
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save notes
                </button>
              </div>
            </form>
          </aside>
        ) : (
          <p className="hidden rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400 lg:block">
            Select an enquiry to view details.
          </p>
        )}
      </div>
    </>
  );
}

export default function AdminEnquiriesPage() {
  return (
    <Suspense>
      <EnquiriesView />
    </Suspense>
  );
}

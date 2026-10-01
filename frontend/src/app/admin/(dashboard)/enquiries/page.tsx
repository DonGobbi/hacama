'use client';

import { Calendar, Download, Inbox, Mail, MapPin, MessageCircle, Phone, Tag, Trash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { EmptyState, ErrorNote, LoadingNote, PageHeader, StatusBadge } from '@/components/admin/AdminShell';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { adminApi } from '@/lib/api';
import { whatsappLink } from '@/lib/company';
import { downloadCsv } from '@/lib/csv';
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
  const [pending, setPending] = useState<Enquiry | null>(null);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState('');

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

  function exportEnquiries() {
    if (!items?.length) return;
    downloadCsv(
      'enquiries.csv',
      ['Name', 'Organization', 'Email', 'Phone', 'Type', 'Status', 'Category', 'Delivery location', 'Needed by', 'Items', 'Message', 'Submitted'],
      items.map((e) => [
        e.name,
        e.organization,
        e.email,
        e.phone,
        e.type,
        e.status,
        e.category,
        e.deliveryLocation,
        e.neededBy ? formatDate(e.neededBy) : '',
        e.items.map((i) => `${i.description}${i.quantity ? ` x${i.quantity}` : ''}`).join('; '),
        e.message,
        formatDate(e.createdAt),
      ]),
    );
  }

  async function remove(enquiry: Enquiry) {
    setBusy(true);
    try {
      await adminApi.deleteEnquiry(enquiry._id);
      setItems((prev) => prev?.filter((e) => e._id !== enquiry._id) ?? null);
      setSelected(null);
      setPending(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const q = query.trim().toLowerCase();
  const filtered =
    items?.filter((e) =>
      !q ||
      [e.name, e.organization, e.email, e.phone, e.message, e.category, e.deliveryLocation]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q),
    ) ?? null;

  return (
    <>
      <PageHeader title="Enquiries" description="Contact messages and quote requests submitted on the website." />
      <ErrorNote message={error} />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          className="input sm:max-w-xs"
          placeholder="Search name, email, phone, company..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
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
        {items && items.length > 0 && (
          <button type="button" className="btn btn-outline btn-sm sm:ml-auto" onClick={exportEnquiries}>
            <Download className="size-3.5" /> Export CSV
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="card divide-y divide-slate-100 self-start">
          {items === null && !error && <LoadingNote />}
          {items?.length === 0 && (
            <EmptyState icon={Inbox} message="No enquiries found." hint="Contact and quote requests submitted on the website appear here." />
          )}
          {items !== null && items.length > 0 && filtered?.length === 0 && (
            <EmptyState icon={Inbox} message={`No enquiries match "${query.trim()}".`} />
          )}
          {filtered?.map((e, i) => (
            <button
              key={e._id}
              type="button"
              onClick={() => setSelected(e)}
              style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
              className={`flex w-full animate-fade-up flex-wrap items-center justify-between gap-2 px-5 py-3 text-left text-sm hover:bg-slate-50 ${selected?._id === e._id ? 'bg-brand-50' : ''}`}
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
                        <td className="px-3 py-2 whitespace-nowrap text-slate-700">{item.quantity || '-'}</td>
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
                <button type="button" className="btn btn-danger btn-sm" onClick={() => setPending(selected)}>
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

      <ConfirmDialog
        open={pending !== null}
        title="Delete enquiry?"
        message={pending ? `Delete the enquiry from ${pending.name}? This cannot be undone.` : ''}
        busy={busy}
        onConfirm={() => pending && remove(pending)}
        onCancel={() => setPending(null)}
      />
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

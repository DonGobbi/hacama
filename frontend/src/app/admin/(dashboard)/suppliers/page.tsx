'use client';

import { CheckCircle2, Factory, Mail, MapPin, Phone, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ErrorNote, PageHeader, StatusBadge } from '@/components/admin/AdminShell';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { Supplier, SupplierStatus } from '@/lib/types';

const STATUSES: SupplierStatus[] = ['new', 'contacted', 'approved', 'rejected'];

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[] | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = () =>
    adminApi
      .suppliers()
      .then(setSuppliers)
      .catch((err: Error) => setError(err.message));

  useEffect(() => {
    load();
  }, []);

  async function setStatus(s: Supplier, status: SupplierStatus) {
    try {
      await adminApi.updateSupplier(s._id, { status });
      setSuppliers((prev) => prev?.map((x) => (x._id === s._id ? { ...x, status } : x)) ?? prev);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function remove(s: Supplier) {
    if (!confirm(`Delete supplier "${s.companyName}"?`)) return;
    try {
      await adminApi.deleteSupplier(s._id);
      setSuppliers((prev) => prev?.filter((x) => x._id !== s._id) ?? prev);
      setNotice('Supplier removed.');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const counts = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = suppliers?.filter((x) => x.status === s).length ?? 0;
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="Suppliers"
        description="Companies that registered on the We Buy page. Track each one through contact, approval, or rejection."
      />
      <ErrorNote message={error} />
      {notice && (
        <p className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <CheckCircle2 className="size-4" /> {notice}
        </p>
      )}

      {suppliers && suppliers.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2 text-sm">
          {STATUSES.map((s) => (
            <span key={s} className="badge border border-slate-200 bg-white px-3 py-1 text-slate-600 capitalize">
              {s}: {counts[s]}
            </span>
          ))}
        </div>
      )}

      {!suppliers && <div className="card h-48 animate-pulse bg-slate-100" />}
      {suppliers && suppliers.length === 0 && (
        <div className="card flex flex-col items-center gap-2 p-10 text-center">
          <Factory className="size-8 text-slate-300" />
          <p className="text-sm text-slate-500">No supplier registrations yet. They appear here when vendors sign up.</p>
        </div>
      )}

      <ul className="space-y-3">
        {suppliers?.map((s) => (
          <li key={s._id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-semibold text-ink-950">{s.companyName}</h3>
                  <StatusBadge value={s.status} />
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {s.contactPerson}
                  {s.location && (
                    <span className="text-slate-400">
                      {' '}· <MapPin className="inline size-3.5 align-[-2px]" /> {s.location}
                    </span>
                  )}
                </p>
                <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                  <a href={`mailto:${s.email}`} className="inline-flex items-center gap-1.5 hover:text-brand-600">
                    <Mail className="size-3.5" /> {s.email}
                  </a>
                  {s.phone && (
                    <a href={`tel:${s.phone}`} className="inline-flex items-center gap-1.5 hover:text-brand-600">
                      <Phone className="size-3.5" /> {s.phone}
                    </a>
                  )}
                </p>
                {s.categories.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {s.categories.map((c) => (
                      <span key={c} className="badge border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs text-slate-600">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
                {s.notes && <p className="mt-2 text-sm whitespace-pre-line text-slate-500">{s.notes}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs text-slate-400">{formatDate(s.createdAt)}</span>
                <select
                  value={s.status}
                  onChange={(e) => setStatus(s, e.target.value as SupplierStatus)}
                  className="input h-8 w-28 text-xs capitalize"
                  aria-label="Supplier status"
                >
                  {STATUSES.map((st) => (
                    <option key={st} value={st} className="capitalize">
                      {st}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => remove(s)}
                  aria-label="Delete supplier"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

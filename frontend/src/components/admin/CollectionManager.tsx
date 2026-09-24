'use client';

import clsx from 'clsx';
import { Eye, EyeOff, Loader2, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ErrorNote, PageHeader } from '@/components/admin/AdminShell';
import { adminApi } from '@/lib/api';
import type { ContentKind } from '@/lib/types';

export type CollectionField = {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'url' | 'select';
  options?: { value: string; label: string }[];
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
  wide?: boolean;
};

type BaseItem = { _id: string; imageUrl?: string; published: boolean; order: number; createdAt: string };

type Props<T extends BaseItem> = {
  kind: ContentKind;
  title: string;
  description: string;
  singular: string;
  imageLabel: string;
  fields: CollectionField[];
  primary: (item: T) => string;
  secondary?: (item: T) => string;
  detail?: (item: T) => string;
  imageClassName?: string;
};

const sortItems = <T extends BaseItem>(items: T[]) =>
  [...items].sort((a, b) => a.order - b.order || b.createdAt.localeCompare(a.createdAt));

export function CollectionManager<T extends BaseItem>({
  kind,
  title,
  description,
  singular,
  imageLabel,
  fields,
  primary,
  secondary,
  detail,
  imageClassName = 'aspect-[16/10] w-full object-cover',
}: Props<T>) {
  const [items, setItems] = useState<T[] | null>(null);
  const [editing, setEditing] = useState<T | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    adminApi
      .contentList<T>(kind)
      .then((data) => setItems(sortItems(data)))
      .catch((err: Error) => setError(err.message));
  }, [kind]);

  const upsert = (item: T) =>
    setItems((prev) => sortItems([...(prev ?? []).filter((i) => i._id !== item._id), item]));

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    form.set('published', form.get('published') ? 'true' : 'false');
    const image = form.get('image');
    if (image instanceof File && image.size === 0) form.delete('image');
    if (editing) form.set('removeImage', form.get('removeImage') ? 'true' : 'false');
    else form.delete('removeImage');

    setError('');
    setSaving(true);
    try {
      const saved = editing
        ? await adminApi.contentUpdate<T>(kind, editing._id, form)
        : await adminApi.contentCreate<T>(kind, form);
      upsert(saved);
      setEditing(null);
      formRef.current?.reset();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(item: T) {
    const form = new FormData();
    form.set('published', item.published ? 'false' : 'true');
    try {
      upsert(await adminApi.contentUpdate<T>(kind, item._id, form));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function remove(item: T) {
    if (!confirm(`Delete "${primary(item)}"?`)) return;
    try {
      await adminApi.contentDelete(kind, item._id);
      setItems((prev) => prev?.filter((i) => i._id !== item._id) ?? null);
      if (editing?._id === item._id) setEditing(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const value = (name: string) =>
    editing ? String((editing as unknown as Record<string, unknown>)[name] ?? '') : undefined;

  return (
    <>
      <PageHeader title={title} description={description} />
      <ErrorNote message={error} />

      <form
        ref={formRef}
        key={editing?._id ?? 'new'}
        onSubmit={submit}
        className={clsx('card mb-8 grid gap-4 p-5 md:grid-cols-2', editing && 'ring-2 ring-brand-600/20')}
      >
        <h2 className="font-semibold text-ink-950 md:col-span-2">{editing ? `Edit ${singular}` : `Add ${singular}`}</h2>

        {fields.map((field) => (
          <label key={field.name} className={clsx('block', (field.wide || field.type === 'textarea') && 'md:col-span-2')}>
            <span className="label">
              {field.label}
              {field.required && ' *'}
            </span>
            {field.type === 'textarea' ? (
              <textarea
                className="input"
                name={field.name}
                rows={4}
                required={field.required}
                minLength={field.minLength}
                maxLength={field.maxLength}
                placeholder={field.placeholder}
                defaultValue={value(field.name)}
              />
            ) : field.type === 'select' ? (
              <select className="input" name={field.name} required={field.required} defaultValue={value(field.name)}>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="input"
                type={field.type ?? 'text'}
                name={field.name}
                required={field.required}
                minLength={field.minLength}
                maxLength={field.maxLength}
                placeholder={field.placeholder}
                defaultValue={value(field.name)}
              />
            )}
          </label>
        ))}

        <label className="block">
          <span className="label">{imageLabel} (JPEG, PNG, WebP — max 5 MB)</span>
          <input
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
          />
          {editing?.imageUrl && (
            <span className="mt-3 flex items-center gap-3">
              <img src={editing.imageUrl} alt="" className="h-12 w-auto max-w-32 rounded-md border border-slate-200 object-contain" />
              <span className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" name="removeImage" className="size-4 accent-brand-600" /> Remove current image
              </span>
            </span>
          )}
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="label">Display order</span>
            <input className="input" type="number" name="order" min={0} defaultValue={editing?.order ?? 0} />
          </label>
          <label className="flex items-center gap-2 self-end pb-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              name="published"
              defaultChecked={editing ? editing.published : true}
              className="size-4 accent-brand-600"
            />
            Show on website
          </label>
        </div>

        <div className="flex justify-end gap-2 md:col-span-2">
          {editing && (
            <button type="button" className="btn btn-outline" onClick={() => setEditing(null)}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : editing ? (
              <Save className="size-4" />
            ) : (
              <Plus className="size-4" />
            )}
            {editing ? 'Save changes' : `Add ${singular}`}
          </button>
        </div>
      </form>

      {items === null && !error && <p className="text-sm text-slate-400">Loading...</p>}
      {items?.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          Nothing added yet. This section stays hidden on the website until you add an entry.
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items?.map((item) => (
          <div key={item._id} className={clsx('card overflow-hidden', !item.published && 'opacity-60')}>
            {item.imageUrl && (
              <div className="border-b border-slate-100 bg-slate-50">
                <img src={item.imageUrl} alt="" className={imageClassName} />
              </div>
            )}
            <div className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink-950">{primary(item)}</p>
                  {secondary?.(item) && <p className="truncate text-xs text-slate-500">{secondary(item)}</p>}
                </div>
                <span
                  className={clsx(
                    'badge shrink-0',
                    item.published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600',
                  )}
                >
                  {item.published ? 'Visible' : 'Hidden'}
                </span>
              </div>
              {detail?.(item) && <p className="line-clamp-3 text-sm text-slate-600">{detail(item)}</p>}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-400">Order {item.order}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => togglePublished(item)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    title={item.published ? 'Hide from website' : 'Show on website'}
                  >
                    {item.published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(item);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                    title="Edit"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(item)}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

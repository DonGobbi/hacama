'use client';

import clsx from 'clsx';
import { Loader2, Pencil, Star, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ErrorNote, PageHeader } from '@/components/admin/AdminShell';
import { adminApi } from '@/lib/api';
import { formatBytes } from '@/lib/format';
import type { Photo } from '@/lib/types';

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    adminApi
      .photos()
      .then(setPhotos)
      .catch((err: Error) => setError(err.message));
  }, []);

  const categories = Array.from(new Set((photos ?? []).map((p) => p.category))).sort();
  const replace = (photo: Photo) => setPhotos((prev) => prev?.map((p) => (p._id === photo._id ? photo : p)) ?? null);

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setUploading(true);
    const form = new FormData(event.currentTarget);
    form.set('featured', form.get('featured') ? 'true' : 'false');
    try {
      const photo = await adminApi.uploadPhoto(form);
      setPhotos((prev) => [photo, ...(prev ?? [])]);
      formRef.current?.reset();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function save(photo: Photo, event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    try {
      replace(
        await adminApi.updatePhoto(photo._id, {
          title: String(f.get('title')),
          caption: String(f.get('caption') ?? ''),
          category: String(f.get('category') || 'General'),
        }),
      );
      setEditing(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function toggleFeatured(photo: Photo) {
    try {
      replace(await adminApi.updatePhoto(photo._id, { featured: !photo.featured }));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function remove(photo: Photo) {
    if (!confirm(`Delete "${photo.title}"? The file will be removed from storage.`)) return;
    try {
      await adminApi.deletePhoto(photo._id);
      setPhotos((prev) => prev?.filter((p) => p._id !== photo._id) ?? null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <>
      <PageHeader title="Photos" description="Upload images to Google Cloud Storage and manage the public gallery." />
      <ErrorNote message={error} />

      <form ref={formRef} onSubmit={upload} className="card mb-8 grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-4">
        <label className="block lg:col-span-4">
          <span className="label">Image (JPEG, PNG, WebP, GIF - max 10 MB) *</span>
          <input
            type="file"
            name="file"
            required
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
          />
        </label>
        <label className="block">
          <span className="label">Title *</span>
          <input className="input" name="title" required minLength={2} />
        </label>
        <label className="block">
          <span className="label">Category</span>
          <input className="input" name="category" list="photo-categories" placeholder="General" />
          <datalist id="photo-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <label className="block lg:col-span-2">
          <span className="label">Caption</span>
          <input className="input" name="caption" />
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="featured" className="size-4 accent-brand-600" /> Feature on home page
        </label>
        <div className="flex justify-end lg:col-span-3">
          <button type="submit" className="btn btn-primary" disabled={uploading}>
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            Upload photo
          </button>
        </div>
      </form>

      {photos === null && !error && <p className="text-sm text-slate-400">Loading...</p>}
      {photos?.length === 0 && <p className="text-sm text-slate-500">No photos uploaded yet.</p>}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {photos?.map((photo) => (
          <div key={photo._id} className="card overflow-hidden">
            <div className="relative">
              <img src={photo.url} alt={photo.title} className="aspect-[4/3] w-full object-cover" />
              <button
                type="button"
                onClick={() => toggleFeatured(photo)}
                title={photo.featured ? 'Unfeature' : 'Feature on home page'}
                className={clsx(
                  'absolute top-2 right-2 rounded-full p-2 shadow',
                  photo.featured ? 'bg-brand-600 text-white' : 'bg-white/90 text-slate-500 hover:text-brand-600',
                )}
              >
                <Star className={clsx('size-4', photo.featured && 'fill-current')} />
              </button>
            </div>
            {editing === photo._id ? (
              <form onSubmit={(e) => save(photo, e)} className="space-y-2 p-4">
                <input className="input" name="title" defaultValue={photo.title} required minLength={2} />
                <input className="input" name="category" defaultValue={photo.category} list="photo-categories" />
                <input className="input" name="caption" defaultValue={photo.caption} placeholder="Caption" />
                <div className="flex justify-end gap-2">
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-start justify-between gap-2 p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink-950">{photo.title}</p>
                  <p className="text-xs text-slate-500">
                    {photo.category} · {formatBytes(photo.size)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" onClick={() => setEditing(photo._id)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Edit">
                    <Pencil className="size-4" />
                  </button>
                  <button type="button" onClick={() => remove(photo)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" title="Delete">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

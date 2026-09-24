'use client';

import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ErrorNote } from '@/components/admin/AdminShell';
import { useAuth } from '@/components/admin/AuthProvider';
import { adminApi } from '@/lib/api';

export default function AccountPage() {
  const { user, refresh } = useAuth();

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setProfileErr('');
    setProfileMsg('');
    setSavingProfile(true);
    try {
      await adminApi.updateProfile({ name, phone });
      refresh();
      setProfileMsg('Profile updated.');
    } catch (err) {
      setProfileErr(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(event: React.FormEvent) {
    event.preventDefault();
    setPwErr('');
    setPwMsg('');
    if (newPassword !== confirmPassword) {
      setPwErr('New passwords do not match.');
      return;
    }
    setSavingPw(true);
    try {
      await adminApi.changePassword({ currentPassword, newPassword });
      setPwMsg('Password changed. It applies from your next sign-in.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwErr(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-ink-950"
      >
        <ArrowLeft className="size-4" /> Back to dashboard
      </Link>

      <div className="mt-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink-950">Account & settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          {user.email} · <span className="capitalize">{user.role === 'superadmin' ? 'Super admin' : 'Admin'}</span>
        </p>
      </div>

      <section className="card mt-6 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-ink-950">Profile</h2>
        <p className="mt-1 text-sm text-slate-500">Your name and contact number shown to other admins.</p>
        <form onSubmit={saveProfile} className="mt-5 space-y-4">
          <label className="block">
            <span className="label">Full name</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
          </label>
          <label className="block">
            <span className="label">Phone (WhatsApp / SMS / calls)</span>
            <input
              className="input"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+265…"
            />
          </label>
          <ErrorNote message={profileErr} />
          {profileMsg && (
            <p className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              <CheckCircle2 className="size-4" /> {profileMsg}
            </p>
          )}
          <button type="submit" className="btn btn-primary" disabled={savingProfile}>
            {savingProfile ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save profile
          </button>
        </form>
      </section>

      <section className="card mt-6 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-ink-950">Change password</h2>
        <p className="mt-1 text-sm text-slate-500">Use a strong password — at least 8 characters.</p>
        <form onSubmit={savePassword} className="mt-5 space-y-4">
          <label className="block">
            <span className="label">Current password</span>
            <input
              className="input"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="label">New password</span>
              <input
                className="input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
            <label className="block">
              <span className="label">Confirm new password</span>
              <input
                className="input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
          </div>
          <ErrorNote message={pwErr} />
          {pwMsg && (
            <p className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              <CheckCircle2 className="size-4" /> {pwMsg}
            </p>
          )}
          <button type="submit" className="btn btn-primary" disabled={savingPw}>
            {savingPw ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
            Change password
          </button>
        </form>
      </section>
    </div>
  );
}

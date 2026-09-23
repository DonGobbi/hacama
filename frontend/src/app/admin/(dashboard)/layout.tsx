import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin/AdminShell';
import { AuthProvider } from '@/components/admin/AuthProvider';

export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminShell>{children}</AdminShell>
    </AuthProvider>
  );
}

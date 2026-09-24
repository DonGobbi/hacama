'use client';

import { Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { clearToken } from '@/lib/auth';
import type { AuthUser } from '@/lib/types';

type AuthContextValue = { user: AuthUser; logout: () => void; refresh: () => void };

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);

  const checkSession = useCallback(() => {
    adminApi
      .me()
      .then((me) => setUser({ id: me._id, name: me.name, email: me.email, phone: me.phone, role: me.role }))
      .catch(() => {
        clearToken();
        router.replace('/admin/login');
      });
  }, [router]);

  // Re-validate the session on every admin navigation, not just first load.
  useEffect(() => {
    checkSession();
  }, [checkSession, pathname]);

  const logout = useCallback(() => {
    clearToken();
    router.replace('/admin/login');
  }, [router]);

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <Loader2 className="size-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return <AuthContext.Provider value={{ user, logout, refresh: checkSession }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

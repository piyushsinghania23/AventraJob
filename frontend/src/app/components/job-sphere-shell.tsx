'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearAdminToken, clearAuthToken, fetchJson, getAdminToken, getAuthToken } from '../api';

type SessionUser = { id: string; email: string; fullName: string; role: string };

export function AventraJobShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setIsAdmin(Boolean(getAdminToken()));
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      return;
    }
    let cancelled = false;
    fetchJson<{ user: SessionUser }>('/auth/me')
      .then((response) => {
        if (!cancelled) setUser(response.user);
      })
      .catch(() => {
        clearAuthToken();
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleLogout() {
    clearAuthToken();
    setUser(null);
    router.push('/');
  }

  function handleAdminSignOut() {
    clearAdminToken();
    setIsAdmin(false);
    router.push('/');
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.2),_transparent_30%),linear-gradient(135deg,_#020617,_#111827)] text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 font-semibold text-white">AJ</div>
            <div>
              <p className="text-lg font-semibold">AventraJob</p>
              <p className="text-xs text-slate-400">India's modern hiring network</p>
            </div>
          </Link>
          <nav className="flex items-center gap-3 text-sm text-slate-300">
            <Link href="/jobs" className="rounded-full px-3 py-2 transition hover:bg-white/10">Jobs</Link>
            <Link href="/dashboard" className="rounded-full px-3 py-2 transition hover:bg-white/10">Dashboard</Link>
            {hydrated && isAdmin ? (
              <>
                <Link href="/admin" className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-amber-200 transition hover:bg-amber-500/20">Admin</Link>
                <button
                  type="button"
                  onClick={handleAdminSignOut}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                >
                  Admin sign out
                </button>
              </>
            ) : hydrated ? (
              <Link href="/auth/admin-login" className="rounded-full border border-amber-400/30 px-3 py-2 text-amber-200 transition hover:bg-amber-500/10">Admin</Link>
            ) : null}
            {hydrated && user ? (
              <div className="flex items-center gap-2">
                <span className="hidden rounded-full bg-white/5 px-3 py-2 text-xs text-slate-300 sm:inline">
                  {user.fullName} <span className="text-slate-500">· {user.role}</span>
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                >
                  Log out
                </button>
              </div>
            ) : (
              <Link href="/auth/login" className="rounded-full bg-white/10 px-4 py-2 font-medium text-white transition hover:bg-white/20">Sign in</Link>
            )}
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}

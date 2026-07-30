'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearAdminToken, fetchJson, setAdminToken } from '../../api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@aventrajob.dev');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    clearAdminToken();
    setIsSubmitting(true);

    try {
      const data = await fetchJson<{ token: string; user: { role: string } }>('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.user.role !== 'admin') {
        throw new Error('This account does not have admin access.');
      }
      setAdminToken(data.token);
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in to the admin console.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.18),_transparent_24%),linear-gradient(135deg,_#020617,_#111827)] px-6 py-16 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-amber-400/10 bg-slate-950/80 p-8 shadow-2xl shadow-amber-950/30 backdrop-blur-xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 font-semibold text-white">AJ</div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Admin console</p>
            <h1 className="text-2xl font-semibold">Sign in to manage AventraJob</h1>
          </div>
        </div>

        <p className="mb-6 text-sm text-slate-400">
          Use the seeded admin credentials (<span className="font-mono text-amber-200">admin@aventrajob.dev</span> / <span className="font-mono text-amber-200">admin123</span>) or any account with role <code>admin</code>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-slate-300" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none"
              placeholder="admin@aventrajob.dev"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none"
              placeholder="••••••••"
            />
          </div>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 px-4 py-3 font-semibold text-white transition hover:from-amber-400 hover:to-rose-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Signing in…' : 'Access admin console'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Just a regular user? <Link href="/auth/login" className="font-semibold text-amber-300">Sign in here</Link>
        </div>
      </div>
    </main>
  );
}

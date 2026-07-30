'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchJson, setAuthToken } from '../../api';
import GoogleSignInButton from '../../components/google-sign-in-button';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams?.get('next') ?? '/dashboard';
  const [email, setEmail] = useState('candidate@aventrajob.dev');
  const [password, setPassword] = useState('candidate123');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const data = await fetchJson<{ token: string; user: { role: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setAuthToken(data.token);
      router.push(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function persistAndRedirect(token: string) {
    setAuthToken(token);
    router.push(nextPath);
  }

  return (
    <div className="space-y-5">
      <GoogleSignInButton
        onSuccess={() => {
          const stored = typeof window !== 'undefined' ? localStorage.getItem('aventrajob_token') : null;
          if (stored) {
            persistAndRedirect(stored);
          }
        }}
      />

      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-500">
        <span className="h-px flex-1 bg-white/10" />
        <span>or sign in with email</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm text-slate-300" htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none ring-0" placeholder="you@company.com" />
        </div>
        <div>
          <label className="mb-2 block text-sm text-slate-300" htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 outline-none ring-0" placeholder="••••••••" />
        </div>
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <button type="submit" disabled={isSubmitting} className="w-full rounded-2xl bg-indigo-500 px-4 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70">{isSubmitting ? 'Signing in…' : 'Continue'}</button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.22),_transparent_24%),linear-gradient(135deg,_#020617,_#111827)] px-6 py-16 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-indigo-950/30 backdrop-blur-xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">Welcome back</p>
          <h1 className="mt-2 text-3xl font-semibold">Sign in to AventraJob</h1>
          <p className="mt-3 text-sm text-slate-400">Use your Google account or your email + password to continue.</p>
        </div>

        <Suspense fallback={<p className="text-sm text-slate-400">Loading…</p>}>
          <LoginForm />
        </Suspense>

        <div className="mt-6 text-center text-sm text-slate-400">
          New here? <Link href="/auth/register" className="font-semibold text-indigo-300">Create an account</Link>
        </div>
      </div>
    </main>
  );
}

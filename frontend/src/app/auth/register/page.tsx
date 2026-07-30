'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchJson, setAuthToken } from '../../api';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('Aditi Rao');
  const [email, setEmail] = useState('aditi@example.com');
  const [password, setPassword] = useState('welcome123');
  const [role, setRole] = useState('candidate');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const data = await fetchJson<{ token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password, role }),
      });
      setAuthToken(data.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create your account.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_24%),linear-gradient(135deg,_#020617,_#111827)] px-6 py-16 text-slate-100">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">Join the platform</p>
          <h1 className="mt-2 text-3xl font-semibold">Build your career or hire the right talent.</h1>
          <p className="mt-3 text-sm text-slate-400">Choose your role and get started with verified opportunities and modern recruiting tools.</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <button type="button" onClick={() => setRole('candidate')} className={`rounded-2xl border p-5 text-left transition ${role === 'candidate' ? 'border-emerald-400/40 bg-emerald-500/10' : 'border-white/10 bg-slate-900/70'}`}>
            <h2 className="font-semibold text-white">Candidate</h2>
            <p className="mt-2 text-sm text-slate-400">Apply faster, save roles, and track progress.</p>
          </button>
          <button type="button" onClick={() => setRole('recruiter')} className={`rounded-2xl border p-5 text-left transition ${role === 'recruiter' ? 'border-emerald-400/40 bg-emerald-500/10' : 'border-white/10 bg-slate-900/70'}`}>
            <h2 className="font-semibold text-white">Recruiter</h2>
            <p className="mt-2 text-sm text-slate-400">Post jobs, manage applicants, and grow your team.</p>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm text-slate-300" htmlFor="fullName">Full name</label>
            <input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3" placeholder="Aarav Sharma" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300" htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3" placeholder="you@company.com" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300" htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3" placeholder="••••••••" />
          </div>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          <button type="submit" disabled={isSubmitting} className="w-full rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70">{isSubmitting ? 'Creating account…' : 'Create account'}</button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account? <Link href="/auth/login" className="font-semibold text-emerald-300">Log in</Link>
        </div>
      </div>
    </main>
  );
}

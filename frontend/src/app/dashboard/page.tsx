'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AventraJobShell } from '../components/job-sphere-shell';
import { clearAuthToken, fetchJson, getAuthToken } from '../api';

type JobItem = {
  id: string;
  title: string;
  company: string;
  location: string;
  employmentType: string;
};

type ApplicationItem = {
  id: string;
  jobId: string;
  status: string;
  createdAt: string;
  job: JobItem;
};

type ApplicationsResponse = {
  stats: { savedRoles: number; applications: number; interviewInvites: number };
  applications: ApplicationItem[];
};

const STATUS_STYLES: Record<string, string> = {
  submitted: 'border-indigo-400/30 bg-indigo-500/10 text-indigo-200',
  reviewing: 'border-amber-400/30 bg-amber-500/10 text-amber-200',
  interview: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
  accepted: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
  rejected: 'border-rose-400/30 bg-rose-500/10 text-rose-200',
};

export default function DashboardPage() {
  const [data, setData] = useState<ApplicationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setAuthed(false);
      setLoading(false);
      return;
    }
    setAuthed(true);
    let cancelled = false;
    fetchJson<ApplicationsResponse>('/applications/me')
      .then((response) => {
        if (!cancelled) setData(response);
      })
      .catch(() => {
        if (!cancelled) {
          clearAuthToken();
          setAuthed(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!authed) {
    return (
      <AventraJobShell>
        <main className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="text-3xl font-semibold">Please sign in to view your dashboard</h1>
          <p className="mt-4 text-slate-400">Your applications and saved roles will appear here once you log in.</p>
          <Link href="/auth/login" className="mt-8 inline-block rounded-full bg-indigo-500 px-5 py-3 font-semibold text-white">Sign in</Link>
        </main>
      </AventraJobShell>
    );
  }

  const cards = data
    ? [
        { title: 'Saved roles', value: data.stats.savedRoles },
        { title: 'Applications', value: data.stats.applications },
        { title: 'Interview invites', value: data.stats.interviewInvites },
      ]
    : [
        { title: 'Saved roles', value: 'â€”' },
        { title: 'Applications', value: 'â€”' },
        { title: 'Interview invites', value: 'â€”' },
      ];

  return (
    <AventraJobShell>
      <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="rounded-[32px] border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-300">Candidate workspace</p>
              <h1 className="mt-2 text-3xl font-semibold">Keep every opportunity in one place.</h1>
            </div>
            <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
              {loading ? 'Loadingâ€¦' : 'Ready to apply'}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {cards.map((card) => (
              <div key={card.title} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-400">{card.title}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{card.value}</p>
              </div>
            ))}
          </div>
        </div>

        <section className="mt-8 rounded-[32px] border border-white/10 bg-slate-950/70 p-8 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white">My applications</h2>
            <Link href="/jobs" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">Browse more jobs</Link>
          </div>

          {loading ? <p className="mt-6 text-slate-400">Loading your applicationsâ€¦</p> : null}
          {!loading && data && data.applications.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center text-slate-400">
              <p>You haven't applied to any jobs yet.</p>
              <Link href="/jobs" className="mt-4 inline-block rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white">Explore jobs</Link>
            </div>
          ) : null}

          <ul className="mt-6 space-y-3">
            {data?.applications.map((application) => {
              const statusStyle = STATUS_STYLES[application.status] ?? STATUS_STYLES.submitted;
              return (
                <li key={application.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div>
                    <Link href={`/jobs/${application.job.id}`} className="text-lg font-semibold text-white hover:text-indigo-200">
                      {application.job.title}
                    </Link>
                    <p className="mt-1 text-sm text-slate-400">{application.job.company} Â· {application.job.location}</p>
                    <p className="mt-2 text-xs text-slate-500">Applied {new Date(application.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusStyle}`}>
                    {application.status}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </AventraJobShell>
  );
}


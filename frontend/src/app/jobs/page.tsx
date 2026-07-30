'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AventraJobShell } from '../components/job-sphere-shell';
import { fetchJson, getAuthToken } from '../api';

type JobItem = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  employmentType: string;
  remoteType: string;
  description: string;
  source: 'internal' | 'aggregated';
};

type ApplicationsResponse = {
  appliedJobIds: string[];
  applications: Array<{ id: string; jobId: string; status: string; createdAt: string; job: JobItem }>;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setIsLoggedIn(Boolean(getAuthToken()));
    async function loadJobs() {
      try {
        const response = await fetchJson<{ jobs: JobItem[] }>('/jobs');
        setJobs(response.jobs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load jobs.');
      } finally {
        setLoading(false);
      }
    }
    void loadJobs();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    let cancelled = false;
    fetchJson<ApplicationsResponse>('/applications/me')
      .then((response) => {
        if (cancelled) return;
        setAppliedJobIds(new Set(response.appliedJobIds));
      })
      .catch(() => {
        // Token may be invalid; ignore silently so the public list still works.
      });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  return (
    <AventraJobShell>
      <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-indigo-300">Discover roles</p>
            <h1 className="mt-2 text-3xl font-semibold">Browse opportunities across India</h1>
          </div>
          {!isLoggedIn ? (
            <Link href="/auth/register" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">Create recruiter account</Link>
          ) : null}
        </div>

        <div className="mb-8 rounded-[24px] border border-white/10 bg-slate-950/70 p-4 backdrop-blur-xl">
          <div className="grid gap-3 md:grid-cols-4">
            <input className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100" placeholder="Job title or keyword" />
            <input className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100" placeholder="City or state" />
            <input className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100" placeholder="Skills" />
            <button className="rounded-2xl bg-indigo-500 px-4 py-3 font-semibold text-white">Search jobs</button>
          </div>
        </div>

        {loading ? <p className="text-slate-400">Loading jobsâ€¦</p> : null}
        {error ? <p className="text-rose-300">{error}</p> : null}
        <div className="grid gap-4 lg:grid-cols-2">
          {jobs.map((job) => {
            const hasApplied = appliedJobIds.has(job.id);
            return (
              <div key={job.id} className="rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      <Link href={`/jobs/${job.id}`} className="hover:text-indigo-200">{job.title}</Link>
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">{job.company}</p>
                  </div>
                  <span className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-sm text-indigo-200">{job.employmentType}</span>
                </div>
                <p className="mt-4 text-sm text-slate-400">{job.location}</p>
                <p className="mt-3 text-sm text-slate-400 line-clamp-3">{job.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-300">{job.salary ?? 'Compensation shared on application'}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{job.source}</span>
                    {hasApplied ? (
                      <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">Applied</span>
                    ) : (
                      <Link href={`/jobs/${job.id}`} className="text-sm font-semibold text-indigo-300">View & apply â†’</Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </AventraJobShell>
  );
}



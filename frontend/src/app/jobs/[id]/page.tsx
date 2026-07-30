'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AventraJobShell } from '../../components/job-sphere-shell';
import { fetchJson, getAuthToken } from '../../api';

type JobItem = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  employmentType: string;
  remoteType: string;
  description: string;
  requirements?: string;
  source: 'internal' | 'aggregated';
  createdAt: string;
};

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [job, setJob] = useState<JobItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');

  useEffect(() => {
    setIsLoggedIn(Boolean(getAuthToken()));
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    fetchJson<{ job: JobItem }>(`/jobs/${id}`)
      .then((response) => {
        if (cancelled) return;
        setJob(response.job);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Unable to load this job.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!isLoggedIn || !id) {
      setHasApplied(false);
      return;
    }
    let cancelled = false;
    fetchJson<{ appliedJobIds: string[] }>('/applications/me')
      .then((response) => {
        if (cancelled) return;
        setHasApplied(response.appliedJobIds.includes(id));
      })
      .catch(() => {
        if (!cancelled) setHasApplied(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, id]);

  async function handleApply() {
    if (!id) return;
    if (!isLoggedIn) {
      router.push(`/auth/login?next=/jobs/${id}`);
      return;
    }
    setIsSubmitting(true);
    setApplyMessage('');
    try {
      await fetchJson<{ application: { id: string } }>(`/applications/jobs/${id}/apply`, {
        method: 'POST',
        body: JSON.stringify({ coverLetter: coverLetter.trim() || undefined }),
      });
      setHasApplied(true);
      setApplyMessage('Application submitted! We will notify you when the team responds.');
    } catch (err) {
      setApplyMessage(err instanceof Error ? err.message : 'Unable to submit your application.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AventraJobShell>
      <main className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
        <Link href="/jobs" className="text-sm text-indigo-300">← Back to jobs</Link>

        {loading ? <p className="mt-8 text-slate-400">Loading job…</p> : null}
        {error ? <p className="mt-8 text-rose-300">{error}</p> : null}

        {job ? (
          <article className="mt-8 space-y-6">
            <header className="rounded-[24px] border border-white/10 bg-slate-950/70 p-8 backdrop-blur-xl">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">{job.company}</p>
                  <h1 className="mt-2 text-3xl font-semibold text-white">{job.title}</h1>
                  <p className="mt-3 text-sm text-slate-400">{job.location}</p>
                </div>
                <span className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-sm text-indigo-200">{job.employmentType} · {job.remoteType}</span>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Compensation</p>
                  <p className="mt-2 text-sm text-emerald-300">{job.salary ?? 'Shared on application'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Source</p>
                  <p className="mt-2 text-sm text-slate-200">{job.source}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Posted</p>
                  <p className="mt-2 text-sm text-slate-200">{new Date(job.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </header>

            <section className="rounded-[24px] border border-white/10 bg-slate-950/70 p-8 backdrop-blur-xl">
              <h2 className="text-lg font-semibold text-white">About the role</h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-300">{job.description}</p>
              {job.requirements ? (
                <>
                  <h3 className="mt-6 text-lg font-semibold text-white">Requirements</h3>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-300">{job.requirements}</p>
                </>
              ) : null}
            </section>

            <section className="rounded-[24px] border border-white/10 bg-slate-950/70 p-8 backdrop-blur-xl">
              <h2 className="text-lg font-semibold text-white">Apply for this role</h2>
              {hasApplied ? (
                <p className="mt-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                  You have already applied to this job. We will let you know when the team reviews your application.
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  <label className="block text-sm text-slate-300" htmlFor="coverLetter">
                    Cover letter (optional)
                  </label>
                  <textarea
                    id="coverLetter"
                    rows={5}
                    value={coverLetter}
                    onChange={(event) => setCoverLetter(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100"
                    placeholder="Tell the team why you're a great fit…"
                  />
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={isSubmitting}
                    className="rounded-2xl bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? 'Submitting…' : isLoggedIn ? 'Submit application' : 'Sign in to apply'}
                  </button>
                  {applyMessage ? <p className="text-sm text-rose-300">{applyMessage}</p> : null}
                </div>
              )}
            </section>
          </article>
        ) : null}
      </main>
    </AventraJobShell>
  );
}

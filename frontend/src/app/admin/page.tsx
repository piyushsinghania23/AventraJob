'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearAdminToken, fetchAdminJson, getAdminToken } from '../api';

type Stats = {
  totalUsers: number;
  totalCompanies: number;
  totalJobs: number;
  pendingCompanies: number;
  pendingJobs: number;
};

type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isVerified: boolean;
  applicationCount: number;
};

type AdminJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  employmentType: string;
  remoteType: string;
  description: string;
  requirements?: string;
  isApproved: boolean;
  source: string;
  createdAt: string;
  applicationCount: number;
};

type Applicant = {
  id: string;
  status: string;
  coverLetter?: string;
  createdAt: string;
  user: { id: string; email: string; fullName: string };
};

type Tab = 'overview' | 'users' | 'jobs';

const STATUS_STYLES: Record<string, string> = {
  submitted: 'border-indigo-400/30 bg-indigo-500/10 text-indigo-200',
  reviewing: 'border-amber-400/30 bg-amber-500/10 text-amber-200',
  interview: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
  accepted: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
  rejected: 'border-rose-400/30 bg-rose-500/10 text-rose-200',
};

export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const [editingJob, setEditingJob] = useState<AdminJob | null>(null);
  const [jobApplicants, setJobApplicants] = useState<{ jobId: string; data: Applicant[] } | null>(null);

  const handleUnauthorized = useCallback(() => {
    clearAdminToken();
    setAuthed(false);
    router.push('/auth/admin-login');
  }, [router]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes, jobsRes] = await Promise.all([
        fetchAdminJson<{ stats: Stats }>('/admin/stats'),
        fetchAdminJson<{ users: AdminUser[] }>('/admin/users'),
        fetchAdminJson<{ jobs: AdminJob[] }>('/admin/jobs'),
      ]);
      setStats(statsRes.stats);
      setUsers(usersRes.users);
      setJobs(jobsRes.jobs);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load admin data.';
      setError(message);
      if (/admin/i.test(message) || /token/i.test(message) || /privileges/i.test(message)) {
        handleUnauthorized();
      }
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      setAuthed(false);
      setLoading(false);
      return;
    }
    setAuthed(true);
    void loadAll();
  }, [loadAll]);

  async function withPending<T>(id: string, fn: () => Promise<T>): Promise<T | undefined> {
    setPendingId(id);
    try {
      return await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setPendingId(null);
    }
  }

  async function toggleJobApproval(job: AdminJob) {
    await withPending(job.id, async () => {
      const path = job.isApproved ? `/admin/jobs/${job.id}/reject` : `/admin/jobs/${job.id}/approve`;
      await fetchAdminJson(path, { method: 'POST' });
      await loadAll();
    });
  }

  async function deleteJob(job: AdminJob) {
    if (!window.confirm(`Delete "${job.title}" at ${job.company}? This also removes its applications.`)) {
      return;
    }
    await withPending(job.id, async () => {
      await fetchAdminJson(`/admin/jobs/${job.id}`, { method: 'DELETE' });
      await loadAll();
    });
  }

  async function saveJobEdits(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingJob) return;
    await withPending(editingJob.id, async () => {
      await fetchAdminJson(`/admin/jobs/${editingJob.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: editingJob.title,
          company: editingJob.company,
          location: editingJob.location,
          salary: editingJob.salary,
          employmentType: editingJob.employmentType,
          remoteType: editingJob.remoteType,
          description: editingJob.description,
          requirements: editingJob.requirements,
          isApproved: editingJob.isApproved,
        }),
      });
      setEditingJob(null);
      await loadAll();
    });
  }

  async function changeUserRole(user: AdminUser, role: string) {
    await withPending(user.id, async () => {
      await fetchAdminJson(`/admin/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      await loadAll();
    });
  }

  async function toggleUserVerified(user: AdminUser) {
    await withPending(user.id, async () => {
      await fetchAdminJson(`/admin/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isVerified: !user.isVerified }),
      });
      await loadAll();
    });
  }

  async function deleteUser(user: AdminUser) {
    if (!window.confirm(`Delete user ${user.email}? This also removes their applications.`)) {
      return;
    }
    await withPending(user.id, async () => {
      await fetchAdminJson(`/admin/users/${user.id}`, { method: 'DELETE' });
      await loadAll();
    });
  }

  async function viewApplicants(job: AdminJob) {
    await withPending(job.id, async () => {
      const res = await fetchAdminJson<{ applicants: Applicant[] }>(`/admin/jobs/${job.id}/applicants`);
      setJobApplicants({ jobId: job.id, data: res.applicants });
    });
  }

  const pendingJobCount = useMemo(() => jobs.filter((job) => !job.isApproved).length, [jobs]);

  if (authed === null) {
    return null;
  }

  if (!authed) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-24 text-center text-slate-100">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-300">Admin console</p>
        <h1 className="mt-3 text-3xl font-semibold">Sign in to access the admin dashboard</h1>
        <p className="mt-4 text-slate-400">Use your admin credentials to manage users and job posts.</p>
        <Link href="/auth/admin-login" className="mt-8 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-5 py-3 font-semibold text-white">
          Go to admin sign in
        </Link>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.18),_transparent_30%),linear-gradient(135deg,_#020617,_#111827)] text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 font-semibold text-white">AJ</div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">Admin console</p>
              <h1 className="text-xl font-semibold">AventraJob Control Center</h1>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/" className="rounded-full border border-white/10 px-4 py-2 text-slate-200 transition hover:bg-white/10">View site</Link>
            <button
              type="button"
              onClick={() => { clearAdminToken(); router.push('/'); }}
              className="rounded-full border border-rose-400/30 px-4 py-2 font-medium text-rose-200 transition hover:bg-rose-500/10"
            >
              Sign out
            </button>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl gap-2 px-6 pb-4 text-sm">
          {(['overview', 'users', 'jobs'] as Tab[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setTab(option)}
              className={`rounded-full px-4 py-2 capitalize transition ${
                tab === option
                  ? 'bg-amber-500 text-slate-950'
                  : 'border border-white/10 text-slate-200 hover:bg-white/10'
              }`}
            >
              {option}
              {option === 'jobs' && pendingJobCount > 0 ? (
                <span className="ml-2 rounded-full bg-rose-500/20 px-2 py-0.5 text-xs text-rose-200">{pendingJobCount} pending</span>
              ) : null}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>
        ) : null}

        {loading ? <p className="text-slate-400">Loading admin data…</p> : null}

        {tab === 'overview' && stats ? (
          <section className="grid gap-4 md:grid-cols-3">
            {[
              { label: 'Total users', value: stats.totalUsers, hint: 'Across all roles' },
              { label: 'Companies', value: stats.totalCompanies, hint: `${stats.pendingCompanies} pending verification` },
              { label: 'Jobs', value: stats.totalJobs, hint: `${stats.pendingJobs} pending approval` },
            ].map((card) => (
              <div key={card.label} className="rounded-[24px] border border-white/10 bg-slate-950/70 p-6 backdrop-blur-xl">
                <p className="text-sm text-slate-400">{card.label}</p>
                <p className="mt-3 text-4xl font-semibold text-white">{card.value}</p>
                <p className="mt-2 text-xs text-slate-500">{card.hint}</p>
              </div>
            ))}
            <div className="md:col-span-3 rounded-[24px] border border-white/10 bg-slate-950/70 p-6">
              <h2 className="text-lg font-semibold">Quick actions</h2>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <button type="button" onClick={() => setTab('users')} className="rounded-full border border-white/10 px-4 py-2 hover:bg-white/10">Manage users</button>
                <button type="button" onClick={() => setTab('jobs')} className="rounded-full border border-white/10 px-4 py-2 hover:bg-white/10">Manage jobs</button>
                {pendingJobCount > 0 ? (
                  <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-4 py-2 text-amber-200">
                    {pendingJobCount} job{pendingJobCount === 1 ? '' : 's'} waiting for approval
                  </span>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {tab === 'users' ? (
          <section className="rounded-[24px] border border-white/10 bg-slate-950/70 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div>
                <h2 className="text-xl font-semibold">Users</h2>
                <p className="text-sm text-slate-400">{users.length} total accounts</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/5 text-sm">
                <thead className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Applications</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <tr key={user.id} className="text-slate-200">
                      <td className="px-6 py-4 font-medium text-white">{user.fullName}</td>
                      <td className="px-6 py-4 text-slate-400">{user.email}</td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          disabled={pendingId === user.id}
                          onChange={(event) => changeUserRole(user, event.target.value)}
                          className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs"
                        >
                          <option value="candidate">candidate</option>
                          <option value="recruiter">recruiter</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          disabled={pendingId === user.id}
                          onClick={() => toggleUserVerified(user)}
                          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                            user.isVerified
                              ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
                              : 'border-amber-400/30 bg-amber-500/10 text-amber-200'
                          }`}
                        >
                          {user.isVerified ? 'verified' : 'unverified'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{user.applicationCount}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          disabled={pendingId === user.id}
                          onClick={() => deleteUser(user)}
                          className="rounded-full border border-rose-400/30 px-3 py-1 text-xs text-rose-200 transition hover:bg-rose-500/10"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {tab === 'jobs' ? (
          <section className="rounded-[24px] border border-white/10 bg-slate-950/70 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div>
                <h2 className="text-xl font-semibold">Job posts</h2>
                <p className="text-sm text-slate-400">{jobs.length} total · {pendingJobCount} pending approval</p>
              </div>
            </div>
            <ul className="divide-y divide-white/5">
              {jobs.map((job) => (
                <li key={job.id} className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                            job.isApproved
                              ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
                              : 'border-amber-400/30 bg-amber-500/10 text-amber-200'
                          }`}
                        >
                          {job.isApproved ? 'live' : 'pending'}
                        </span>
                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">{job.source}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-400">{job.company} · {job.location} · {job.employmentType} · {job.remoteType}</p>
                      {job.salary ? <p className="mt-1 text-sm text-slate-400">{job.salary}</p> : null}
                      <p className="mt-3 text-sm text-slate-300 line-clamp-2">{job.description}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        Posted {new Date(job.createdAt).toLocaleString()} · {job.applicationCount} applicant{job.applicationCount === 1 ? '' : 's'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <button
                        type="button"
                        disabled={pendingId === job.id}
                        onClick={() => toggleJobApproval(job)}
                        className={`rounded-full border px-3 py-1 font-semibold ${
                          job.isApproved
                            ? 'border-amber-400/30 text-amber-200 hover:bg-amber-500/10'
                            : 'border-emerald-400/30 text-emerald-200 hover:bg-emerald-500/10'
                        }`}
                      >
                        {job.isApproved ? 'Unapprove' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        disabled={pendingId === job.id}
                        onClick={() => viewApplicants(job)}
                        className="rounded-full border border-white/10 px-3 py-1 text-slate-200 hover:bg-white/10"
                      >
                        Applicants ({job.applicationCount})
                      </button>
                      <button
                        type="button"
                        disabled={pendingId === job.id}
                        onClick={() => setEditingJob({ ...job })}
                        className="rounded-full border border-indigo-400/30 px-3 py-1 text-indigo-200 hover:bg-indigo-500/10"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={pendingId === job.id}
                        onClick={() => deleteJob(job)}
                        className="rounded-full border border-rose-400/30 px-3 py-1 text-rose-200 hover:bg-rose-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {jobApplicants?.jobId === job.id ? (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-white">Applicants</h4>
                        <button type="button" onClick={() => setJobApplicants(null)} className="text-xs text-slate-400 hover:text-slate-200">Close</button>
                      </div>
                      {jobApplicants.data.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-400">No applications yet.</p>
                      ) : (
                        <ul className="mt-3 space-y-2 text-sm">
                          {jobApplicants.data.map((applicant) => (
                            <li key={applicant.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                              <div>
                                <p className="font-medium text-white">{applicant.user.fullName}</p>
                                <p className="text-xs text-slate-400">{applicant.user.email} · applied {new Date(applicant.createdAt).toLocaleDateString()}</p>
                              </div>
                              <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.2em] ${STATUS_STYLES[applicant.status] ?? STATUS_STYLES.submitted}`}>
                                {applicant.status}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : null}
                </li>
              ))}
              {jobs.length === 0 ? <li className="p-6 text-sm text-slate-400">No jobs in the system yet.</li> : null}
            </ul>
          </section>
        ) : null}
      </main>

      {editingJob ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8 backdrop-blur">
          <form
            onSubmit={saveJobEdits}
            className="w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Edit job</h2>
              <button type="button" onClick={() => setEditingJob(null)} className="text-sm text-slate-400 hover:text-slate-200">Cancel</button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Title">
                <input className={inputClass} value={editingJob.title} onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })} />
              </Field>
              <Field label="Company">
                <input className={inputClass} value={editingJob.company} onChange={(e) => setEditingJob({ ...editingJob, company: e.target.value })} />
              </Field>
              <Field label="Location">
                <input className={inputClass} value={editingJob.location} onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })} />
              </Field>
              <Field label="Salary">
                <input className={inputClass} value={editingJob.salary ?? ''} onChange={(e) => setEditingJob({ ...editingJob, salary: e.target.value })} />
              </Field>
              <Field label="Employment type">
                <input className={inputClass} value={editingJob.employmentType} onChange={(e) => setEditingJob({ ...editingJob, employmentType: e.target.value })} />
              </Field>
              <Field label="Remote type">
                <input className={inputClass} value={editingJob.remoteType} onChange={(e) => setEditingJob({ ...editingJob, remoteType: e.target.value })} />
              </Field>
              <div className="md:col-span-2">
                <Field label="Description">
                  <textarea className={`${inputClass} h-28 resize-y`} value={editingJob.description} onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })} />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Requirements">
                  <textarea className={`${inputClass} h-20 resize-y`} value={editingJob.requirements ?? ''} onChange={(e) => setEditingJob({ ...editingJob, requirements: e.target.value })} />
                </Field>
              </div>
              <Field label="Approved">
                <label className="flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={editingJob.isApproved}
                    onChange={(e) => setEditingJob({ ...editingJob, isApproved: e.target.checked })}
                  />
                  Visible to candidates
                </label>
              </Field>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setEditingJob(null)} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">Cancel</button>
              <button type="submit" disabled={pendingId === editingJob.id} className="rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-slate-950">
                {pendingId === editingJob.id ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

const inputClass =
  'w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-amber-400/40';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-400">{label}</span>
      {children}
    </label>
  );
}

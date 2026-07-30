import Link from 'next/link';
import { AventraJobShell } from './components/job-sphere-shell';

const highlights = [
  'Verified companies',
  'Internal + aggregated listings',
  'Recruiter dashboards',
  'Admin moderation tools',
];

export default function Home() {
  return (
    <AventraJobShell>
      <main className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-16 lg:px-8">
        <section className="grid gap-8 rounded-[32px] border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-indigo-950/20 backdrop-blur-xl lg:grid-cols-[1.2fr_0.8fr] lg:p-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-indigo-300">AventraJob</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              Build your next chapter with trusted opportunities across India.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-400">
              Discover jobs, post openings, and manage recruiting in one beautifully crafted experience for candidates, companies, and admins.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/jobs" className="rounded-full bg-indigo-500 px-5 py-3 font-semibold text-white transition hover:bg-indigo-400">Explore jobs</Link>
              <Link href="/auth/register" className="rounded-full border border-white/10 px-5 py-3 font-semibold text-slate-200 transition hover:bg-white/10">Join as recruiter</Link>
            </div>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Platform highlights</p>
            <div className="mt-5 space-y-3">
              {highlights.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            ['For candidates', 'Find curated roles, filter by city or remote setup, and apply in minutes.'],
            ['For companies', 'Post direct jobs and verify your hiring presence with a modern company workspace.'],
            ['For admins', 'Moderate listings, review companies, and keep the platform high quality.'],
          ].map(([title, body]) => (
            <div key={title} className="rounded-[24px] border border-white/10 bg-slate-950/70 p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold text-white">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">{body}</p>
            </div>
          ))}
        </section>
      </main>
    </AventraJobShell>
  );
}

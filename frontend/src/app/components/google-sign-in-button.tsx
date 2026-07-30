'use client';

import { useState } from 'react';
import { GoogleCredential, signInWithGoogle } from '../../api';

type GoogleAccount = {
  email: string;
  fullName: string;
  picture?: string;
};

const PRESET_ACCOUNTS: GoogleAccount[] = [
  {
    email: 'candidate@aventrajob.dev',
    fullName: 'Neha Sharma',
    picture: 'https://api.dicebear.com/9.x/initials/svg?seed=Neha%20Sharma',
  },
  {
    email: 'recruiter@aventrajob.dev',
    fullName: 'Rohan Mehta',
    picture: 'https://api.dicebear.com/9.x/initials/svg?seed=Rohan%20Mehta',
  },
  {
    email: 'admin@aventrajob.dev',
    fullName: 'Ava Patel',
    picture: 'https://api.dicebear.com/9.x/initials/svg?seed=Ava%20Patel',
  },
];

type GoogleSignInButtonProps = {
  onSuccess?: (user: { email: string; fullName: string; role: string }) => void;
  label?: string;
  role?: string;
  accent?: 'indigo' | 'emerald';
};

export default function GoogleSignInButton({
  onSuccess,
  label = 'Continue with Google',
  role,
  accent = 'indigo',
}: GoogleSignInButtonProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function pickAccount(account: GoogleAccount) {
    setError('');
    setIsSubmitting(true);
    try {
      const credential: GoogleCredential = {
        sub: `google-${account.email}`,
        email: account.email,
        name: account.fullName,
        picture: account.picture,
        email_verified: true,
      };
      const data = await signInWithGoogle(credential, role);
      onSuccess?.(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in with Google.');
    } finally {
      setIsSubmitting(false);
      setIsPickerOpen(false);
    }
  }

  const accentRing = accent === 'emerald' ? 'focus:ring-emerald-400' : 'focus:ring-indigo-400';
  const accentText = accent === 'emerald' ? 'text-emerald-300' : 'text-indigo-300';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setError('');
          setIsPickerOpen((open) => !open);
        }}
        disabled={isSubmitting}
        className={`flex w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/95 px-4 py-3 font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus:ring-2 ${accentRing}`}
      >
        <GoogleLogo />
        <span>{isSubmitting ? 'Connecting…' : label}</span>
      </button>

      {isPickerOpen ? (
        <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-slate-950/50 backdrop-blur-xl">
          <div className="border-b border-white/10 px-4 py-3">
            <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${accentText}`}>Choose an account</p>
            <p className="mt-1 text-sm text-slate-300">to continue to <span className="font-semibold text-white">AventraJob</span></p>
          </div>
          <ul className="divide-y divide-white/5">
            {PRESET_ACCOUNTS.map((account) => (
              <li key={account.email}>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => pickAccount(account)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/5 disabled:opacity-50"
                >
                  {account.picture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={account.picture}
                      alt={account.fullName}
                      className="h-9 w-9 rounded-full border border-white/10 bg-white/10"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white">
                      {account.fullName.charAt(0)}
                    </div>
                  )}
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold text-white">{account.fullName}</span>
                    <span className="text-xs text-slate-400">{account.email}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-white/10 px-4 py-2 text-[11px] text-slate-500">
            Demo mode: pick any account to continue.
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-2 text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.972 32.91 29.388 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.197l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.366 0-9.931-3.066-11.287-7.951l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.566l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}
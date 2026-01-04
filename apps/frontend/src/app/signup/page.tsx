'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { request } from '@/lib/api';
import { ShieldCheck } from 'lucide-react';

interface AuthResponse {
  user: { id: string; email: string; name: string };
  token: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await request<AuthResponse>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      router.push('/care-profiles');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-5xl mx-auto grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <section className="space-y-6 animate-fade-up">
          <div className="chip w-fit">CareCircle Journal</div>
          <h1 className="text-4xl text-ink">Create a shared home for your care notes.</h1>
          <p className="text-lg text-ink-muted">
            Invite your circle, keep the daily story consistent, and let patterns surface gently over time.
          </p>
          <div className="card-inset p-5 space-y-3">
            <div className="flex items-center gap-2 text-sage">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs uppercase tracking-[0.2em]">Privacy-first</span>
            </div>
            <p className="text-sm text-ink-muted">
              Your data stays in your care circle. Export or remove entries at any time.
            </p>
          </div>
        </section>

        <section className="card p-8 animate-fade-up" style={{ animationDelay: '120ms' }}>
          <div className="mb-8">
            <h2 className="text-2xl text-ink">Create account</h2>
            <p className="text-ink-muted mt-2">Start your caregiving journal in minutes.</p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-[rgba(198,107,78,0.3)] bg-[rgba(198,107,78,0.12)] p-4 text-sm text-[#7b3f2b]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-ink-muted mb-2">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                className="input w-full text-ink placeholder:text-ink-faint"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-muted mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input w-full text-ink placeholder:text-ink-faint"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink-muted mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="input w-full text-ink"
                placeholder="Min. 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink-muted mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="input w-full text-ink"
                placeholder="Confirm your password"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-ink-muted">
            Already have an account?{' '}
            <Link href="/login" className="text-clay font-semibold">
              Sign in
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

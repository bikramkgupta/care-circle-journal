'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { request } from '@/lib/api';
import { Sparkles } from 'lucide-react';

interface AuthResponse {
  user: { id: string; email: string; name: string };
  token: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      router.push('/care-profiles');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-5xl mx-auto grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <section className="space-y-6 animate-fade-up">
          <div className="chip w-fit">CareCircle Journal</div>
          <h1 className="text-4xl text-ink">Welcome back to your shared care story.</h1>
          <p className="text-lg text-ink-muted">
            Pick up where you left off, review the latest entries, and keep the circle aligned with a clear daily
            view.
          </p>
          <div className="card-inset p-5 space-y-3">
            <div className="flex items-center gap-2 text-sage">
              <Sparkles className="w-5 h-5" />
              <span className="text-xs uppercase tracking-[0.2em]">Today’s cue</span>
            </div>
            <p className="text-sm text-ink-muted">
              Morning routine completed smoothly. Consider logging sensory triggers after 3pm.
            </p>
          </div>
        </section>

        <section className="card p-8 animate-fade-up" style={{ animationDelay: '120ms' }}>
          <div className="mb-8">
            <h2 className="text-2xl text-ink">Sign in</h2>
            <p className="text-ink-muted mt-2">Access your care profiles and journal entries.</p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-[rgba(198,107,78,0.3)] bg-[rgba(198,107,78,0.12)] p-4 text-sm text-[#7b3f2b]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                className="input w-full text-ink"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-ink-muted">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-clay font-semibold">
              Sign up
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-mist text-center">
            <Link href="/demo" className="text-ink-muted hover:text-ink text-sm">
              Try demo mode →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { request } from '@/lib/api';
import { Play, Loader2, Sparkles } from 'lucide-react';

export default function DemoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTryDemo = async () => {
    setLoading(true);
    setError('');

    try {
      // Login as demo user
      const response = await request<{ user: any; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'demo@example.com',
          password: 'password123',
        }),
      });

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      router.push('/care-profiles');
    } catch (err) {
      setError('Demo not available. Please run the seed script first: pnpm --filter @care-circle/api seed:demo');
      console.error('Demo login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="card p-10 text-center animate-fade-up">
          <div className="mx-auto mb-6 h-16 w-16 rounded-3xl bg-[rgba(198,107,78,0.15)] flex items-center justify-center">
            <Play className="w-8 h-8 text-clay" />
          </div>

          <h1 className="text-3xl text-ink mb-2">Step into the Demo Journal</h1>
          <p className="text-ink-muted mb-8 max-w-2xl mx-auto">
            Explore CareCircle Journal with a full sample timeline, summaries, and insights. No sign-up required.
          </p>

          {error && (
            <div className="mb-6 rounded-2xl border border-[rgba(198,107,78,0.3)] bg-[rgba(198,107,78,0.12)] p-4 text-sm text-[#7b3f2b] text-left">
              {error}
            </div>
          )}

          <button onClick={handleTryDemo} disabled={loading} className="btn-primary w-full sm:w-auto">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading Demo...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Enter Demo Mode
              </span>
            )}
          </button>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 text-left">
            {[
              'Sample care profile “Demo: Alex” with realistic daily rhythm',
              '30 days of entries: sleep, meals, activities, symptoms',
              'AI-powered daily summaries for quick caregiver handoff',
              'Mood and sleep analytics with insight prompts',
            ].map((item, index) => (
              <div key={item} className="card-inset p-4">
                <div className="flex items-center gap-2 text-sage mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-[0.18em]">Included</span>
                </div>
                <p className="text-sm text-ink-muted">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

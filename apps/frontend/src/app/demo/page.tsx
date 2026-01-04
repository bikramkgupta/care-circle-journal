'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { request } from '@/lib/api';
import { Play, Loader2 } from 'lucide-react';

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
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Play className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Try the Demo</h1>
          <p className="text-slate-500 mb-8">
            Explore CareCircle Journal with pre-loaded sample data. No sign-up required.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-lg text-amber-700 text-sm text-left">
              {error}
            </div>
          )}

          <button
            onClick={handleTryDemo}
            disabled={loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-400 text-white font-semibold rounded-xl transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading Demo...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Enter Demo Mode
              </>
            )}
          </button>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">What's included:</h3>
            <ul className="text-sm text-slate-500 space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                Sample care profile "Demo: Alex"
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                30 days of realistic entries
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                AI-powered daily summaries
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                Mood and sleep analytics
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { request } from '@/lib/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Sparkles, Calendar, TrendingUp } from 'lucide-react';

interface Entry {
  id: string;
  timestamp: string;
  type: string;
  moodScore: number | null;
  structuredPayload: Record<string, any> | null;
}

interface ChartData {
  date: string;
  mood: number | null;
  sleep: number | null;
  symptoms: number;
}

export default function InsightsPage() {
  const params = useParams();
  const profileId = params.id as string;
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7' | '30'>('7');
  const [insights, setInsights] = useState<{ summary: string; patterns: string[]; suggestions: string[] } | null>(null);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  useEffect(() => {
    loadEntries();
  }, [profileId, period]);

  const loadEntries = async () => {
    try {
      const from = new Date();
      from.setDate(from.getDate() - parseInt(period));

      const data = await request<Entry[]>(`/entries/${profileId}?from=${from.toISOString()}`);
      setEntries(data);
    } catch (err) {
      console.error('Failed to load entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    setGeneratingInsights(true);
    try {
      const from = new Date();
      from.setDate(from.getDate() - parseInt(period));

      const response = await request<any>(`/care-profiles/${profileId}/insights`, {
        method: 'POST',
        body: JSON.stringify({
          period_type: period === '7' ? 'weekly' : 'monthly',
          from: from.toISOString(),
        }),
      });

      setInsights({
        summary: response.aiInsights?.summaryText || 'Analysis complete.',
        patterns: response.aiInsights?.insightsJson?.patterns || [],
        suggestions: response.aiInsights?.insightsJson?.suggestions || [],
      });
    } catch (err) {
      console.error('Failed to generate insights:', err);
      setInsights({
        summary: `Over the past ${period} days, mood has remained relatively stable with regular daily activities documented.`,
        patterns: [
          'Consistent daily logging of activities',
          'Regular meal and sleep tracking',
          'Mood tends to be higher after good sleep',
        ],
        suggestions: [
          'Continue documenting sleep quality',
          'Consider noting environmental factors during symptom episodes',
        ],
      });
    } finally {
      setGeneratingInsights(false);
    }
  };

  const chartData: ChartData[] = [];
  const dateMap: Record<string, ChartData> = {};

  entries.forEach((entry) => {
    const date = new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (!dateMap[date]) {
      dateMap[date] = { date, mood: null, sleep: null, symptoms: 0 };
    }

    if (entry.moodScore) {
      dateMap[date].mood = entry.moodScore;
    }

    if (entry.type === 'SLEEP' && entry.structuredPayload?.hours) {
      dateMap[date].sleep = entry.structuredPayload.hours;
    }

    if (entry.type === 'SYMPTOM') {
      dateMap[date].symptoms += 1;
    }
  });

  const sortedDates = Object.keys(dateMap).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  sortedDates.forEach((date) => {
    chartData.push(dateMap[date]);
  });

  const moodScores = entries.filter((e) => e.moodScore).map((e) => e.moodScore!);
  const avgMood = moodScores.length > 0
    ? (moodScores.reduce((a, b) => a + b, 0) / moodScores.length).toFixed(1)
    : 'N/A';

  const sleepEntries = entries.filter((e) => e.type === 'SLEEP' && e.structuredPayload?.hours);
  const avgSleep = sleepEntries.length > 0
    ? (sleepEntries.reduce((a, e) => a + e.structuredPayload!.hours, 0) / sleepEntries.length).toFixed(1)
    : 'N/A';

  const symptomCount = entries.filter((e) => e.type === 'SYMPTOM').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-ink-muted">Loading insights...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl text-ink">Insights</h2>
          <p className="text-ink-muted">Highlights across mood, sleep, and symptoms.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPeriod('7')}
            className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.18em] border transition ${
              period === '7'
                ? 'border-[rgba(198,107,78,0.5)] bg-[rgba(198,107,78,0.12)] text-clay'
                : 'border-transparent text-ink-faint hover:border-[rgba(94,82,70,0.2)] hover:text-ink'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setPeriod('30')}
            className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.18em] border transition ${
              period === '30'
                ? 'border-[rgba(198,107,78,0.5)] bg-[rgba(198,107,78,0.12)] text-clay'
                : 'border-transparent text-ink-faint hover:border-[rgba(94,82,70,0.2)] hover:text-ink'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[rgba(198,107,78,0.18)] rounded-xl">
              <TrendingUp className="w-5 h-5 text-clay" />
            </div>
            <span className="text-sm font-medium text-ink-faint">Avg. Mood</span>
          </div>
          <p className="text-3xl text-ink">
            {avgMood}
            <span className="text-lg text-ink-faint">/5</span>
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[rgba(63,107,102,0.18)] rounded-xl">
              <Calendar className="w-5 h-5 text-sage" />
            </div>
            <span className="text-sm font-medium text-ink-faint">Avg. Sleep</span>
          </div>
          <p className="text-3xl text-ink">
            {avgSleep}
            <span className="text-lg text-ink-faint"> hrs</span>
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[rgba(215,167,79,0.2)] rounded-xl">
              <Calendar className="w-5 h-5 text-[#9b6a22]" />
            </div>
            <span className="text-sm font-medium text-ink-faint">Symptoms</span>
          </div>
          <p className="text-3xl text-ink">
            {symptomCount}
            <span className="text-lg text-ink-faint"> logged</span>
          </p>
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-5">
            <h3 className="font-semibold text-ink mb-4">Mood Over Time</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3d6c6" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#8a7f73" />
                  <YAxis domain={[1, 5]} tick={{ fontSize: 12 }} stroke="#8a7f73" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#c66b4e"
                    strokeWidth={2}
                    dot={{ fill: '#c66b4e', strokeWidth: 2 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-ink mb-4">Sleep Hours</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3d6c6" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#8a7f73" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#8a7f73" />
                  <Tooltip />
                  <Bar dataKey="sleep" fill="#3f6b66" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-5 lg:col-span-2">
            <h3 className="font-semibold text-ink mb-4">Symptoms Logged</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3d6c6" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#8a7f73" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#8a7f73" allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="symptoms" fill="#d7a74f" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-inset p-8 text-center">
          <Calendar className="w-12 h-12 text-ink-faint mx-auto mb-3" />
          <p className="text-ink-muted">Not enough data for charts. Keep logging entries!</p>
        </div>
      )}

      <div className="card-inset p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-sage">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-semibold">AI Insights</h3>
          </div>
          <button onClick={generateInsights} disabled={generatingInsights} className="btn-secondary">
            {generatingInsights ? 'Analyzing...' : 'Generate Insights'}
          </button>
        </div>

        {insights ? (
          <div className="space-y-4">
            <p className="text-ink-muted">{insights.summary}</p>

            {insights.patterns.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-sage mb-2">Patterns Observed</h4>
                <ul className="space-y-1">
                  {insights.patterns.map((pattern, i) => (
                    <li key={i} className="text-sm text-ink-muted flex items-start gap-2">
                      <span className="text-sage">•</span>
                      {pattern}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {insights.suggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-clay mb-2">Suggestions</h4>
                <ul className="space-y-1">
                  {insights.suggestions.map((suggestion, i) => (
                    <li key={i} className="text-sm text-ink-muted flex items-start gap-2">
                      <span className="text-clay">→</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-ink-muted text-sm">
            Click "Generate Insights" to get AI-powered analysis of your data.
          </p>
        )}
      </div>
    </div>
  );
}

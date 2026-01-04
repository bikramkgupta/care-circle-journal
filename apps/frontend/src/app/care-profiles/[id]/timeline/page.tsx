'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { request } from '@/lib/api';
import { Plus, Sparkles, Clock, Utensils, Moon, AlertTriangle, Activity, Pill, FileText } from 'lucide-react';

interface Entry {
  id: string;
  timestamp: string;
  type: string;
  freeText: string;
  moodScore: number | null;
  tags: Record<string, string> | null;
  structuredPayload: Record<string, any> | null;
  author: { name: string };
}

interface Summary {
  id: string;
  periodStart: string;
  summaryText: string;
  insightsJson: {
    positives?: string[];
    concerns?: string[];
    flags?: string[];
  };
}

const typeIcons: Record<string, any> = {
  NOTE: FileText,
  SLEEP: Moon,
  MEAL: Utensils,
  SYMPTOM: AlertTriangle,
  ACTIVITY: Activity,
  MEDICATION: Pill,
};

const typeColors: Record<string, string> = {
  NOTE: 'bg-slate-100 text-slate-600',
  SLEEP: 'bg-indigo-100 text-indigo-600',
  MEAL: 'bg-amber-100 text-amber-600',
  SYMPTOM: 'bg-red-100 text-red-600',
  ACTIVITY: 'bg-green-100 text-green-600',
  MEDICATION: 'bg-purple-100 text-purple-600',
};

const moodEmojis = ['😢', '😔', '😐', '🙂', '😊'];

export default function TimelinePage() {
  const params = useParams();
  const profileId = params.id as string;
  const [entries, setEntries] = useState<Entry[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [generatingDate, setGeneratingDate] = useState<string | null>(null);

  // Form state
  const [entryType, setEntryType] = useState('NOTE');
  const [freeText, setFreeText] = useState('');
  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, [profileId]);

  const loadData = async () => {
    try {
      const [entriesData, summariesData] = await Promise.all([
        request<Entry[]>(`/entries/${profileId}`),
        request<Summary[]>(`/summaries/${profileId}`),
      ]);
      setEntries(entriesData);
      setSummaries(summariesData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      await request(`/entries/${profileId}`, {
        method: 'POST',
        body: JSON.stringify({
          type: entryType,
          freeText,
          moodScore,
          timestamp: new Date().toISOString(),
        }),
      });
      setShowCreate(false);
      setFreeText('');
      setMoodScore(null);
      loadData();
    } catch (err) {
      console.error('Failed to create entry:', err);
    } finally {
      setCreating(false);
    }
  };

  const generateSummary = async (date: string) => {
    setGeneratingDate(date);
    try {
      await request(`/summaries/${profileId}/daily`, {
        method: 'POST',
        body: JSON.stringify({ date }),
      });
      loadData();
    } catch (err) {
      console.error('Failed to generate summary:', err);
    } finally {
      setGeneratingDate(null);
    }
  };

  // Group entries by date
  const groupedEntries = entries.reduce((acc, entry) => {
    const date = new Date(entry.timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, Entry[]>);

  // Get summary for a date
  const getSummaryForDate = (dateStr: string) => {
    const targetDate = new Date(dateStr).toISOString().split('T')[0];
    return summaries.find((s) => s.periodStart.startsWith(targetDate));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-slate-500">Loading timeline...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Timeline</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-5 h-5" />
          New Entry
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">New Entry</h3>
          <form onSubmit={handleCreateEntry} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(typeIcons).map((type) => {
                  const Icon = typeIcons[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setEntryType(type)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                        entryType === type
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm capitalize">{type.toLowerCase()}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Note</label>
              <textarea
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                placeholder="What happened?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Mood (optional)</label>
              <div className="flex gap-2">
                {moodEmojis.map((emoji, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setMoodScore(moodScore === i + 1 ? null : i + 1)}
                    className={`w-10 h-10 rounded-lg border text-xl transition ${
                      moodScore === i + 1
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
              >
                {creating ? 'Saving...' : 'Save Entry'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {Object.keys(groupedEntries).length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No entries yet</h3>
          <p className="text-slate-500 mb-6">Start documenting by creating your first entry</p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            Create Entry
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedEntries).map(([date, dayEntries]) => {
            const summary = getSummaryForDate(dayEntries[0].timestamp);
            const dateStr = new Date(dayEntries[0].timestamp).toISOString().split('T')[0];

            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">{date}</h3>
                  <button
                    onClick={() => generateSummary(dateStr)}
                    disabled={generatingDate === dateStr}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition"
                  >
                    <Sparkles className="w-4 h-4" />
                    {generatingDate === dateStr
                      ? 'Generating...'
                      : summary
                      ? 'Regenerate Summary'
                      : 'Generate Summary'}
                  </button>
                </div>

                {summary && (
                  <div className="mb-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-purple-900">AI Summary</span>
                    </div>
                    <p className="text-slate-700 mb-4">{summary.summaryText}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {summary.insightsJson.positives && summary.insightsJson.positives.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-green-600 uppercase tracking-wide">
                            Positives
                          </span>
                          <ul className="mt-1 space-y-1">
                            {summary.insightsJson.positives.map((p, i) => (
                              <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                <span className="text-green-500">✓</span>
                                {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {summary.insightsJson.concerns && summary.insightsJson.concerns.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">
                            Concerns
                          </span>
                          <ul className="mt-1 space-y-1">
                            {summary.insightsJson.concerns.map((c, i) => (
                              <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                <span className="text-amber-500">!</span>
                                {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {dayEntries.map((entry) => {
                    const Icon = typeIcons[entry.type] || FileText;
                    const time = new Date(entry.timestamp).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={entry.id}
                        className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${typeColors[entry.type] || typeColors.NOTE}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-slate-900 capitalize">
                                {entry.type.toLowerCase()}
                              </span>
                              <span className="text-xs text-slate-400">{time}</span>
                              {entry.moodScore && (
                                <span className="ml-auto text-lg">{moodEmojis[entry.moodScore - 1]}</span>
                              )}
                            </div>
                            <p className="text-slate-600">{entry.freeText}</p>
                            <p className="text-xs text-slate-400 mt-2">by {entry.author.name}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


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
  NOTE: 'bg-[rgba(231,217,201,0.7)] text-[color:var(--ink-muted)]',
  SLEEP: 'bg-[rgba(63,107,102,0.18)] text-[color:var(--sage)]',
  MEAL: 'bg-[rgba(215,167,79,0.2)] text-[#8a5a1f]',
  SYMPTOM: 'bg-[rgba(198,107,78,0.2)] text-[#8b3f2b]',
  ACTIVITY: 'bg-[rgba(63,107,102,0.16)] text-[#2f4f4b]',
  MEDICATION: 'bg-[rgba(94,82,70,0.16)] text-[#5f483a]',
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
        <div className="animate-pulse text-ink-muted">Loading timeline...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl text-ink">Timeline</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Entry
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 card p-6">
          <h3 className="text-lg text-ink mb-4">New Entry</h3>
          <form onSubmit={handleCreateEntry} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-muted mb-2">Type</label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(typeIcons).map((type) => {
                  const Icon = typeIcons[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setEntryType(type)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-full border text-sm transition ${
                        entryType === type
                          ? 'border-[rgba(198,107,78,0.5)] bg-[rgba(198,107,78,0.12)] text-clay'
                          : 'border-[rgba(94,82,70,0.2)] text-ink-muted hover:border-[rgba(94,82,70,0.4)]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="capitalize">{type.toLowerCase()}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-muted mb-2">Note</label>
              <textarea
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                required
                rows={3}
                className="input w-full text-ink"
                placeholder="What happened?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-muted mb-2">Mood (optional)</label>
              <div className="flex gap-2">
                {moodEmojis.map((emoji, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setMoodScore(moodScore === i + 1 ? null : i + 1)}
                    className={`w-10 h-10 rounded-full border text-xl transition ${
                      moodScore === i + 1
                        ? 'border-[rgba(198,107,78,0.5)] bg-[rgba(198,107,78,0.12)]'
                        : 'border-[rgba(94,82,70,0.2)] hover:border-[rgba(94,82,70,0.4)]'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={creating} className="btn-primary">
                {creating ? 'Saving...' : 'Save Entry'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {Object.keys(groupedEntries).length === 0 ? (
        <div className="card-inset text-center py-16">
          <Clock className="w-16 h-16 text-ink-faint mx-auto mb-4" />
          <h3 className="text-lg text-ink mb-2">No entries yet</h3>
          <p className="text-ink-muted mb-6">Start documenting by creating your first entry.</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex items-center gap-2">
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
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h3 className="text-xl text-ink">{date}</h3>
                  <button
                    onClick={() => generateSummary(dateStr)}
                    disabled={generatingDate === dateStr}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-full border border-[rgba(63,107,102,0.35)] text-sage bg-[rgba(63,107,102,0.12)] hover:bg-[rgba(63,107,102,0.2)] transition"
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
                  <div className="mb-4 card-inset p-5">
                    <div className="flex items-center gap-2 mb-3 text-sage">
                      <Sparkles className="w-5 h-5" />
                      <span className="font-semibold">AI Summary</span>
                    </div>
                    <p className="text-ink-muted mb-4">{summary.summaryText}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {summary.insightsJson.positives && summary.insightsJson.positives.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-sage uppercase tracking-wide">
                            Positives
                          </span>
                          <ul className="mt-1 space-y-1">
                            {summary.insightsJson.positives.map((p, i) => (
                              <li key={i} className="text-sm text-ink-muted flex items-start gap-2">
                                <span className="text-sage">✓</span>
                                {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {summary.insightsJson.concerns && summary.insightsJson.concerns.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-clay uppercase tracking-wide">
                            Concerns
                          </span>
                          <ul className="mt-1 space-y-1">
                            {summary.insightsJson.concerns.map((c, i) => (
                              <li key={i} className="text-sm text-ink-muted flex items-start gap-2">
                                <span className="text-clay">!</span>
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
                      <div key={entry.id} className="card p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-xl ${typeColors[entry.type] || typeColors.NOTE}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-ink capitalize">
                                {entry.type.toLowerCase()}
                              </span>
                              <span className="text-xs text-ink-faint">{time}</span>
                              {entry.moodScore && (
                                <span className="ml-auto text-lg">{moodEmojis[entry.moodScore - 1]}</span>
                              )}
                            </div>
                            <p className="text-ink-muted">{entry.freeText}</p>
                            <p className="text-xs text-ink-faint mt-2">by {entry.author.name}</p>
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

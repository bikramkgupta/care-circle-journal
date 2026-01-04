'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { request } from '@/lib/api';
import { Plus, Users, Calendar, LogOut, Sparkles } from 'lucide-react';

interface CareProfile {
  id: string;
  name: string;
  dateOfBirth: string | null;
  notes: string | null;
  createdAt: string;
}

export default function CareProfilesPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<CareProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    loadProfiles();
  }, [router]);

  const loadProfiles = async () => {
    try {
      const data = await request<CareProfile[]>('/care-profiles');
      setProfiles(data);
    } catch (err) {
      console.error('Failed to load profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      await request('/care-profiles', {
        method: 'POST',
        body: JSON.stringify({ name: newName, notes: newNotes }),
      });
      setNewName('');
      setNewNotes('');
      setShowCreate(false);
      loadProfiles();
    } catch (err) {
      console.error('Failed to create profile:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-ink-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white/70 backdrop-blur-md border-b border-mist sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[rgba(198,107,78,0.18)] flex items-center justify-center text-clay font-semibold">
              CC
            </div>
            <div>
              <h1 className="text-lg text-ink">CareCircle Journal</h1>
              <p className="text-xs uppercase tracking-[0.2em] text-ink-faint">Care Profiles</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-ink-muted hover:text-ink">
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sign out</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl text-ink">Care profiles</h2>
            <p className="text-ink-muted mt-1">Select a profile or start a new one.</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            <span>New profile</span>
          </button>
        </div>

        {showCreate && (
          <div className="card p-6">
            <div className="flex items-center gap-2 text-sage mb-4">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-lg text-ink">Create new profile</h3>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-muted mb-2">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="input w-full"
                  placeholder="e.g. Alex"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-muted mb-2">Notes (optional)</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={3}
                  className="input w-full"
                  placeholder="Any helpful context..."
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="submit" disabled={creating} className="btn-primary">
                  {creating ? 'Creating...' : 'Create Profile'}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-outline">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {profiles.length === 0 ? (
          <div className="card-inset text-center py-16">
            <Users className="w-16 h-16 text-ink-faint mx-auto mb-4" />
            <h3 className="text-lg text-ink mb-2">No profiles yet</h3>
            <p className="text-ink-muted mb-6">Create your first care profile to get started.</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create profile
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <Link
                key={profile.id}
                href={`/care-profiles/${profile.id}/timeline`}
                className="card p-6 group transition hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[rgba(63,107,102,0.18)] flex items-center justify-center">
                    <span className="text-xl font-semibold text-sage">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-ink-faint flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl text-ink mt-4 group-hover:text-clay transition">
                  {profile.name}
                </h3>
                {profile.notes && (
                  <p className="text-sm text-ink-muted mt-2 line-clamp-2">{profile.notes}</p>
                )}
                <div className="mt-4 text-sm text-sage font-semibold">View timeline →</div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

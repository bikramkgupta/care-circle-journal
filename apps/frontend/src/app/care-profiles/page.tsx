'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { request } from '@/lib/api';
import { Plus, Users, Calendar, LogOut } from 'lucide-react';

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">CareCircle Journal</h1>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sign out</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Care Profiles</h2>
            <p className="text-slate-500 mt-1">Select or create a profile to start logging</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-5 h-5" />
            <span>New Profile</span>
          </button>
        </div>

        {showCreate && (
          <div className="mb-8 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Create New Profile</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  placeholder="e.g., Alex"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes (optional)</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  placeholder="Any helpful context..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
                >
                  {creating ? 'Creating...' : 'Create Profile'}
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

        {profiles.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No profiles yet</h3>
            <p className="text-slate-500 mb-6">Create your first care profile to get started</p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              Create Profile
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <Link
                key={profile.id}
                href={`/care-profiles/${profile.id}/timeline`}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-blue-200 transition group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-600">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mt-4 group-hover:text-blue-600 transition">
                  {profile.name}
                </h3>
                {profile.notes && (
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">{profile.notes}</p>
                )}
                <div className="mt-4 text-sm text-blue-600 font-medium">
                  View timeline →
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


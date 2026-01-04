'use client';

import Link from 'next/link';
import { usePathname, useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { request } from '@/lib/api';
import { Calendar, BarChart3, Image, ArrowLeft, LogOut } from 'lucide-react';

interface CareProfile {
  id: string;
  name: string;
  notes: string | null;
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const profileId = params.id as string;
  const [profile, setProfile] = useState<CareProfile | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    request<CareProfile>(`/care-profiles/${profileId}`)
      .then(setProfile)
      .catch(() => router.push('/care-profiles'));
  }, [profileId, router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const navItems = [
    { href: `/care-profiles/${profileId}/timeline`, label: 'Timeline', icon: Calendar },
    { href: `/care-profiles/${profileId}/insights`, label: 'Insights', icon: BarChart3 },
    { href: `/care-profiles/${profileId}/moments`, label: 'Moments', icon: Image },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/care-profiles"
                className="flex items-center gap-1 text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
              </Link>
              <div className="h-6 w-px bg-slate-200" />
              <h1 className="font-bold text-slate-900">
                {profile?.name || 'Loading...'}
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-700"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Sign out</span>
            </button>
          </div>
          <nav className="flex gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}


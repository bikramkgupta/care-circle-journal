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
    <div className="min-h-screen">
      <header className="bg-white/70 backdrop-blur-md border-b border-mist sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/care-profiles" className="chip flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Link>
              <div className="h-8 w-px bg-[rgba(94,82,70,0.2)]" />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ink-faint">Profile</p>
                <h1 className="text-lg text-ink">{profile?.name || 'Loading...'}</h1>
              </div>
            </div>
            <button onClick={handleLogout} className="btn-outline flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Sign out</span>
            </button>
          </div>
          <nav className="flex flex-wrap gap-2 pb-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition ${
                    isActive
                      ? 'border-[rgba(198,107,78,0.6)] bg-[rgba(198,107,78,0.12)] text-clay'
                      : 'border-transparent text-ink-muted hover:border-[rgba(94,82,70,0.2)] hover:bg-white/60'
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
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}

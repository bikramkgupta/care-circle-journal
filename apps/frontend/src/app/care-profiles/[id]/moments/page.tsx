'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { request } from '@/lib/api';
import { Image as ImageIcon, X, Upload, Calendar, Filter } from 'lucide-react';

interface MediaAsset {
  id: string;
  type: string;
  mimeType: string;
  createdAt: string;
  entry?: {
    freeText: string;
    timestamp: string;
    tags?: Record<string, string>;
  };
}

interface MediaWithUrl extends MediaAsset {
  url?: string;
}

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'therapy', label: 'Therapy' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'progress', label: 'Progress' },
];

export default function MomentsPage() {
  const params = useParams();
  const profileId = params.id as string;
  const [media, setMedia] = useState<MediaWithUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedMedia, setSelectedMedia] = useState<MediaWithUrl | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadMedia();
  }, [profileId]);

  const loadMedia = async () => {
    try {
      const entries = await request<any[]>(`/entries/${profileId}`);

      const mediaItems: MediaWithUrl[] = [];

      entries.forEach((entry, index) => {
        if (entry.type === 'ACTIVITY' && index % 3 === 0) {
          mediaItems.push({
            id: `media-${entry.id}`,
            type: 'PHOTO',
            mimeType: 'image/jpeg',
            createdAt: entry.timestamp,
            entry: {
              freeText: entry.freeText,
              timestamp: entry.timestamp,
              tags: entry.tags,
            },
          });
        }
      });

      setMedia(mediaItems);
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMedia = media.filter((item) => {
    if (filter === 'all') return true;
    return (
      item.entry?.tags?.context?.toLowerCase() === filter ||
      item.entry?.tags?.category?.toLowerCase() === filter
    );
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    setTimeout(() => {
      alert(
        'File upload would be handled here. This requires:\n1. Creating an entry\n2. Getting presigned URL\n3. Uploading to DO Spaces'
      );
      setUploading(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-ink-muted">Loading moments...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl text-ink">Moments</h2>
          <p className="text-ink-muted">Visual highlights and sensory wins from the week.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-ink-faint" />
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.18em] border transition ${
                  filter === option.value
                    ? 'border-[rgba(198,107,78,0.5)] bg-[rgba(198,107,78,0.12)] text-clay'
                    : 'border-transparent text-ink-faint hover:border-[rgba(94,82,70,0.2)] hover:text-ink'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <label className="btn-primary flex items-center gap-2 cursor-pointer">
            <Upload className="w-5 h-5" />
            <span>{uploading ? 'Uploading...' : 'Upload'}</span>
            <input
              type="file"
              accept="image/*,audio/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {filteredMedia.length === 0 ? (
        <div className="card-inset text-center py-16">
          <ImageIcon className="w-16 h-16 text-ink-faint mx-auto mb-4" />
          <h3 className="text-lg text-ink mb-2">No moments yet</h3>
          <p className="text-ink-muted mb-6 max-w-md mx-auto">
            Capture special moments by uploading photos or audio recordings with your entries.
          </p>
          <label className="btn-primary inline-flex items-center gap-2 cursor-pointer">
            <Upload className="w-5 h-5" />
            Upload First Moment
            <input type="file" accept="image/*,audio/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {filteredMedia.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedMedia(item)}
              className="aspect-square card-inset overflow-hidden relative group"
            >
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[rgba(63,107,102,0.2)] to-[rgba(198,107,78,0.2)]">
                <ImageIcon className="w-12 h-12 text-ink-faint" />
              </div>

              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[rgba(33,27,22,0.8)] to-transparent opacity-0 group-hover:opacity-100 transition">
                <p className="text-white text-sm font-medium truncate">
                  {item.entry?.freeText?.slice(0, 50)}
                </p>
                <p className="text-white/70 text-xs flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(33,27,22,0.85)] p-4">
          <button
            onClick={() => setSelectedMedia(null)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="max-w-4xl w-full card overflow-hidden">
            <div className="aspect-video bg-[rgba(94,82,70,0.12)] flex items-center justify-center">
              <ImageIcon className="w-24 h-24 text-ink-faint" />
            </div>
            <div className="p-6">
              <p className="text-ink-muted mb-2">{selectedMedia.entry?.freeText}</p>
              <p className="text-ink-faint text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(selectedMedia.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

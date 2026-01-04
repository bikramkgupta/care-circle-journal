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
      // For now, we'll show a placeholder since we need entries with media
      // In a real app, you'd fetch from /care-profiles/:id/media
      const entries = await request<any[]>(`/entries/${profileId}`);
      
      // Filter entries that have media (for demo, we'll simulate some)
      const mediaItems: MediaWithUrl[] = [];
      
      // Simulate some media items from entries
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
    return item.entry?.tags?.context?.toLowerCase() === filter ||
           item.entry?.tags?.category?.toLowerCase() === filter;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    // In a real app, you would:
    // 1. Create an entry first
    // 2. Get a presigned URL from /care-profiles/:id/media/presign
    // 3. Upload to Spaces using the presigned URL
    // 4. Refresh the media list
    
    setTimeout(() => {
      alert('File upload would be handled here. This requires:\n1. Creating an entry\n2. Getting presigned URL\n3. Uploading to DO Spaces');
      setUploading(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-slate-500">Loading moments...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Moments</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                  filter === option.value
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition cursor-pointer shadow-lg shadow-blue-500/25">
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
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No moments yet</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Capture special moments by uploading photos or audio recordings with your entries.
          </p>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition cursor-pointer">
            <Upload className="w-5 h-5" />
            Upload First Moment
            <input
              type="file"
              accept="image/*,audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {filteredMedia.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedMedia(item)}
              className="aspect-square bg-slate-100 rounded-xl overflow-hidden relative group hover:shadow-lg transition"
            >
              {/* Placeholder for image - in real app, load from Spaces URL */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                <ImageIcon className="w-12 h-12 text-slate-400" />
              </div>
              
              {/* Overlay with date */}
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition">
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

      {/* Lightbox Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <button
            onClick={() => setSelectedMedia(null)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div className="max-w-4xl w-full bg-white rounded-2xl overflow-hidden">
            <div className="aspect-video bg-slate-100 flex items-center justify-center">
              <ImageIcon className="w-24 h-24 text-slate-300" />
            </div>
            <div className="p-6">
              <p className="text-slate-700 mb-2">{selectedMedia.entry?.freeText}</p>
              <p className="text-slate-400 text-sm flex items-center gap-2">
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


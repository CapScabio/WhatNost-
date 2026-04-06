'use client';

import { useEffect, useState } from 'react';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { useAuthStore } from '@/store/auth';
import {
  connectNDK,
  fetchFollowers,
  fetchFollowing,
  fetchUserNotes,
  formatTimestamp,
} from '@/lib/nostr';

export default function Profile() {
  const { isConnected, profile } = useAuthStore();
  const [followers, setFollowers] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [notes, setNotes] = useState<NDKEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'likes'>('posts');

  useEffect(() => {
    if (isConnected && profile) {
      loadProfileData();
    }
  }, [isConnected, profile]);

  const loadProfileData = async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      await connectNDK();
      
      const [followersData, followingData, notesData] = await Promise.all([
        fetchFollowers(profile.pubkey),
        fetchFollowing(profile.pubkey),
        fetchUserNotes(profile.pubkey, 20),
      ]);
      
      setFollowers(followersData);
      setFollowing(followingData);
      setNotes(notesData);
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-white mb-2">Nostr Starter Kit</h1>
          <p className="text-zinc-400 mb-6">Login to see your profile</p>
          <div className="text-sm text-zinc-500">
            Connect with Extension, nsec, or Bunker
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      {/* Banner */}
      <div className="h-48 bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 relative">
        {profile.banner && (
          <img
            src={profile.banner}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Profile Header */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="relative -mt-16 mb-4">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full border-4 border-black bg-zinc-900 overflow-hidden">
            {profile.picture ? (
              <img
                src={profile.picture}
                alt={profile.name || 'Profile'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-purple-600 flex items-center justify-center text-white text-4xl">
                {(profile.name || profile.displayName || 'N')[0].toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Name & Bio */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white">
            {profile.displayName || profile.name || 'Anonymous'}
          </h1>
          {profile.name && profile.displayName && profile.name !== profile.displayName && (
            <div className="text-zinc-500">@{profile.name}</div>
          )}
          {profile.nip05 && (
            <div className="text-purple-400 text-sm flex items-center gap-1 mt-1">
              <span>✓</span>
              <span>{profile.nip05}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {profile.about && (
          <p className="text-zinc-300 mb-4 whitespace-pre-wrap">{profile.about}</p>
        )}

        {/* Links */}
        <div className="flex flex-wrap gap-4 text-sm text-zinc-400 mb-4">
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-purple-400 transition"
            >
              <span>🔗</span>
              <span>{profile.website.replace(/^https?:\/\//, '')}</span>
            </a>
          )}
          {profile.lud16 && (
            <div className="flex items-center gap-1 text-yellow-500">
              <span>⚡</span>
              <span>{profile.lud16}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-6 mb-6">
          <div className="text-center">
            <div className="text-xl font-bold text-white">
              {loading ? '...' : following.length}
            </div>
            <div className="text-sm text-zinc-500">Following</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">
              {loading ? '...' : followers.length}
            </div>
            <div className="text-sm text-zinc-500">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">
              {loading ? '...' : notes.length}
            </div>
            <div className="text-sm text-zinc-500">Notes</div>
          </div>
        </div>

        {/* Pubkey */}
        <div className="p-3 bg-zinc-900 rounded-lg mb-6">
          <div className="text-xs text-zinc-500 mb-1">Public Key (npub)</div>
          <div className="text-sm text-zinc-300 font-mono break-all">
            {profile.npub}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-zinc-800 mb-4">
          <div className="flex gap-8">
            {(['posts', 'replies', 'likes'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium transition border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'text-white border-purple-500'
                    : 'text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Notes Feed */}
        <div className="space-y-4 pb-8">
          {loading ? (
            <div className="text-center py-8 text-zinc-500">
              <div className="animate-spin inline-block mr-2">⚡</div>
              Loading notes...
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              No notes yet
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition"
              >
                <div className="flex items-center gap-3 mb-3">
                  {profile.picture ? (
                    <img
                      src={profile.picture}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white">
                      {(profile.name || 'N')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">
                      {profile.displayName || profile.name || 'Anonymous'}
                    </div>
                    <div className="text-sm text-zinc-500">
                      {formatTimestamp(note.created_at || 0)}
                    </div>
                  </div>
                </div>
                <p className="text-zinc-200 whitespace-pre-wrap break-words">
                  {note.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

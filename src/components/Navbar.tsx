'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import LoginModal from './LoginModal';

export default function Navbar() {
  const [showLogin, setShowLogin] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { isConnected, profile, logout } = useAuthStore();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-lg border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔐</span>
            <span className="font-bold text-xl text-white">Nostr Starter</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {isConnected && profile ? (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 p-1 pr-3 bg-zinc-800 hover:bg-zinc-700 rounded-full transition"
                >
                  {profile.picture ? (
                    <img
                      src={profile.picture}
                      alt={profile.name || 'Profile'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm">
                      {(profile.name || profile.displayName || 'N')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm text-white font-medium max-w-[100px] truncate">
                    {profile.displayName || profile.name || 'Anon'}
                  </span>
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
                    <div className="p-3 border-b border-zinc-800">
                      <div className="text-sm text-white font-medium truncate">
                        {profile.displayName || profile.name}
                      </div>
                      <div className="text-xs text-zinc-500 truncate">
                        {profile.npub.slice(0, 16)}...
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setShowMenu(false);
                      }}
                      className="w-full p-3 text-left text-sm text-red-400 hover:bg-zinc-800 transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition flex items-center gap-2"
              >
                <span>🔑</span>
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}

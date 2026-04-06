'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import {
  connectNDK,
  loginWithExtension,
  loginWithNsec,
  loginWithBunker,
  LoginMethod,
} from '@/lib/nostr';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [method, setMethod] = useState<LoginMethod | null>(null);
  const [nsecInput, setNsecInput] = useState('');
  const [bunkerInput, setBunkerInput] = useState('');
  const [extensionAvailable, setExtensionAvailable] = useState(false);
  const { setUser, setLoading, setError, isLoading, error } = useAuthStore();

  // Check if extension is available on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.nostr) {
      setExtensionAvailable(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (loginMethod: LoginMethod) => {
    setLoading(true);
    setError(null);

    try {
      await connectNDK();

      let user = null;

      switch (loginMethod) {
        case 'extension':
          if (!window.nostr) {
            throw new Error('Nostr extension not detected. Make sure Alby or nos2x is installed and tap the extension icon.');
          }
          user = await loginWithExtension();
          break;
        case 'nsec':
          if (!nsecInput.trim()) {
            throw new Error('Please enter your nsec');
          }
          user = await loginWithNsec(nsecInput);
          break;
        case 'bunker':
          if (!bunkerInput.trim()) {
            throw new Error('Please enter your bunker URL');
          }
          user = await loginWithBunker(bunkerInput);
          break;
      }

      if (user) {
        setUser(user, loginMethod);
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-2xl max-w-md w-full p-6 border border-zinc-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Login to Nostr</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {!method ? (
          <div className="space-y-3">
            {/* Extension (Alby) */}
            <button
              onClick={() => handleLogin('extension')}
              disabled={isLoading || !extensionAvailable}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition ${
                extensionAvailable
                  ? 'bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30'
                  : 'bg-zinc-800/30 border border-zinc-700/30 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-xl">🦊</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">Browser Extension</div>
                <div className="text-sm text-zinc-400">Alby, nos2x, or similar</div>
              </div>
            </button>

            {/* nsec */}
            <button
              onClick={() => setMethod('nsec')}
              disabled={isLoading}
              className="w-full flex items-center gap-3 p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-xl transition disabled:opacity-50"
            >
              <div className="w-10 h-10 bg-zinc-700 rounded-lg flex items-center justify-center">
                <span className="text-xl">🔑</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">Private Key (nsec)</div>
                <div className="text-sm text-zinc-400">Enter your nsec directly</div>
              </div>
            </button>

            {/* Bunker */}
            <button
              onClick={() => setMethod('bunker')}
              disabled={isLoading}
              className="w-full flex items-center gap-3 p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-xl transition disabled:opacity-50"
            >
              <div className="w-10 h-10 bg-zinc-700 rounded-lg flex items-center justify-center">
                <span className="text-xl">🏰</span>
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">Nostr Bunker</div>
                <div className="text-sm text-zinc-400">Remote signer (NIP-46)</div>
              </div>
            </button>
          </div>
        ) : method === 'nsec' ? (
          <div className="space-y-4">
            <button
              onClick={() => setMethod(null)}
              className="text-zinc-400 hover:text-white text-sm flex items-center gap-1"
            >
              ← Back
            </button>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Enter your nsec (private key)
              </label>
              <input
                type="password"
                value={nsecInput}
                onChange={(e) => setNsecInput(e.target.value)}
                placeholder="nsec1..."
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
              <p className="mt-2 text-xs text-zinc-500">
                ⚠️ Never share your nsec. It will be stored in memory only.
              </p>
            </div>
            <button
              onClick={() => handleLogin('nsec')}
              disabled={isLoading || !nsecInput.trim()}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition disabled:opacity-50"
            >
              {isLoading ? 'Connecting...' : 'Login'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setMethod(null)}
              className="text-zinc-400 hover:text-white text-sm flex items-center gap-1"
            >
              ← Back
            </button>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Bunker URL
              </label>
              <input
                type="text"
                value={bunkerInput}
                onChange={(e) => setBunkerInput(e.target.value)}
                placeholder="bunker://..."
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
              <p className="mt-2 text-xs text-zinc-500">
                Get this from your nsecBunker or similar remote signer.
              </p>
            </div>
            <button
              onClick={() => handleLogin('bunker')}
              disabled={isLoading || !bunkerInput.trim()}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition disabled:opacity-50"
            >
              {isLoading ? 'Connecting...' : 'Login'}
            </button>
          </div>
        )}

        {isLoading && (
          <div className="mt-4 text-center text-zinc-400">
            <div className="inline-block animate-spin mr-2">⚡</div>
            Connecting to relays...
          </div>
        )}
      </div>
    </div>
  );
}

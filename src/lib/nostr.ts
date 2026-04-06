import NDK, { NDKEvent, NDKUser, NDKNip07Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
import { nip19 } from 'nostr-tools';

// Default relays
export const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://nos.lol',
  'wss://relay.primal.net',
];

// Global NDK instance
let ndkInstance: NDK | null = null;

export function getNDK(): NDK {
  if (!ndkInstance) {
    ndkInstance = new NDK({
      explicitRelayUrls: DEFAULT_RELAYS,
    });
  }
  return ndkInstance;
}

export async function connectNDK(): Promise<NDK> {
  const ndk = getNDK();
  await ndk.connect();
  return ndk;
}

// Login methods
export type LoginMethod = 'extension' | 'nsec' | 'bunker';

export async function loginWithExtension(): Promise<NDKUser | null> {
  if (typeof window === 'undefined' || !window.nostr) {
    throw new Error('No Nostr extension found. Install Alby or nos2x.');
  }
  
  const ndk = getNDK();
  const signer = new NDKNip07Signer();
  ndk.signer = signer;
  
  const user = await signer.user();
  await user.fetchProfile();
  
  return user;
}

export async function loginWithNsec(nsec: string): Promise<NDKUser | null> {
  let privateKey: string;
  
  try {
    if (nsec.startsWith('nsec')) {
      const decoded = nip19.decode(nsec);
      if (decoded.type !== 'nsec') throw new Error('Invalid nsec');
      // Convert Uint8Array to hex string
      const bytes = decoded.data as Uint8Array;
      privateKey = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
      privateKey = nsec;
    }
  } catch {
    throw new Error('Invalid nsec format');
  }
  
  const ndk = getNDK();
  const signer = new NDKPrivateKeySigner(privateKey);
  ndk.signer = signer;
  
  const user = await signer.user();
  await user.fetchProfile();
  
  return user;
}

export async function loginWithBunker(bunkerUrl: string): Promise<NDKUser | null> {
  // bunker://pubkey?relay=wss://relay.nsecbunker.com
  const ndk = getNDK();
  
  // Parse bunker URL
  const url = new URL(bunkerUrl);
  const remotePubkey = url.hostname;
  const relayUrl = url.searchParams.get('relay');
  
  if (!remotePubkey || !relayUrl) {
    throw new Error('Invalid bunker URL format');
  }
  
  // Dynamic import for bunker signer
  const { NDKNip46Signer } = await import('@nostr-dev-kit/ndk');
  
  const localSigner = NDKPrivateKeySigner.generate();
  const bunkerSigner = new NDKNip46Signer(ndk, remotePubkey, localSigner);
  
  await bunkerSigner.blockUntilReady();
  ndk.signer = bunkerSigner;
  
  const user = await bunkerSigner.user();
  await user.fetchProfile();
  
  return user;
}

// Profile types
export interface NostrProfile {
  pubkey: string;
  npub: string;
  name?: string;
  displayName?: string;
  about?: string;
  picture?: string;
  banner?: string;
  nip05?: string;
  lud16?: string;
  website?: string;
}

export function parseProfile(user: NDKUser): NostrProfile {
  const profile = user.profile || {};
  return {
    pubkey: user.pubkey,
    npub: user.npub,
    name: profile.name,
    displayName: (profile.displayName || profile.display_name) as string | undefined,
    about: profile.about as string | undefined,
    picture: (profile.image || profile.picture) as string | undefined,
    banner: profile.banner,
    nip05: profile.nip05,
    lud16: profile.lud16,
    website: profile.website,
  };
}

// Fetch followers and following
export async function fetchFollowers(pubkey: string): Promise<string[]> {
  const ndk = getNDK();
  
  // Kind 3 events where the user is tagged
  const filter = {
    kinds: [3],
    '#p': [pubkey],
  };
  
  const events = await ndk.fetchEvents(filter);
  const followers = new Set<string>();
  
  events.forEach((event) => {
    followers.add(event.pubkey);
  });
  
  return Array.from(followers);
}

export async function fetchFollowing(pubkey: string): Promise<string[]> {
  const ndk = getNDK();
  const user = ndk.getUser({ pubkey });
  
  const followSet = await user.follows();
  return Array.from(followSet).map((u) => u.pubkey);
}

// Fetch user's notes
export async function fetchUserNotes(pubkey: string, limit = 20): Promise<NDKEvent[]> {
  const ndk = getNDK();
  
  const filter = {
    kinds: [1],
    authors: [pubkey],
    limit,
  };
  
  const events = await ndk.fetchEvents(filter);
  return Array.from(events).sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
}

// Format pubkey for display
export function formatPubkey(pubkey: string): string {
  const npub = nip19.npubEncode(pubkey);
  return `${npub.slice(0, 8)}...${npub.slice(-4)}`;
}

// Format timestamp
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  
  return date.toLocaleDateString();
}

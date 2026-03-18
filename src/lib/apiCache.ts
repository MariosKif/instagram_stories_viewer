/**
 * Firestore-backed API cache layer.
 * Replaces in-memory Maps that get wiped on every Vercel cold start.
 *
 * Two collections:
 *   - searchCache/{username}         — full combined result (6h TTL)
 *   - apiCache/{username}:{dataType} — per-data-type fallback
 */
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';

/* ── TTLs (milliseconds) ──────────────────────────── */

const TTL: Record<string, number> = {
  profile: 4 * 60 * 60 * 1000,
  posts: 2 * 60 * 60 * 1000,
  stories: 30 * 60 * 1000,
  highlights: 4 * 60 * 60 * 1000,
  highlightStories: 4 * 60 * 60 * 1000,
};

const SEARCH_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours
export const POPULAR_CACHE_TTL = 15 * 24 * 60 * 60 * 1000; // 15 days

/* ── Per-data-type cache (apiCache collection) ────── */

export async function getCachedApiData(
  username: string,
  dataType: string,
): Promise<any | null> {
  try {
    const db = getFirebaseDb();
    const docId = `${username.toLowerCase()}_${dataType}`;
    const snap = await getDoc(doc(db, 'apiCache', docId));
    if (!snap.exists()) return null;

    const entry = snap.data();
    const ttlExpiry = entry.ttlExpiry?.toMillis?.() ?? 0;
    if (Date.now() > ttlExpiry) return null;

    return entry.data ?? null;
  } catch (err) {
    console.error(`[apiCache] read error ${username}:${dataType}`, err);
    return null;
  }
}

export function setCachedApiData(
  username: string,
  dataType: string,
  data: any,
): void {
  // Fire-and-forget — don't block the response
  const ttlMs = TTL[dataType] ?? 2 * 60 * 60 * 1000;
  const now = Date.now();
  const db = getFirebaseDb();
  const docId = `${username.toLowerCase()}:${dataType}`;

  setDoc(doc(db, 'apiCache', docId), {
    username: username.toLowerCase(),
    dataType,
    data,
    fetchedAt: Timestamp.fromMillis(now),
    ttlExpiry: Timestamp.fromMillis(now + ttlMs),
  }).catch((err) => {
    console.error(`[apiCache] write error ${username}:${dataType}`, err);
  });
}

/* ── Search-level cache (searchCache collection) ──── */

export interface SearchCacheDoc {
  username: string;
  profile: Record<string, any>;
  posts: Record<string, any>;
  stories: Record<string, any> | null;
  highlights: Record<string, any> | null;
  report: Record<string, any>;
  fetchedAt: Timestamp;
  ttlExpiry: Timestamp;
}

export async function getSearchCache(
  username: string,
): Promise<SearchCacheDoc | null> {
  try {
    const db = getFirebaseDb();
    const snap = await getDoc(doc(db, 'searchCache', username.toLowerCase()));
    if (!snap.exists()) return null;

    const entry = snap.data() as SearchCacheDoc;
    const ttlExpiry = entry.ttlExpiry?.toMillis?.() ?? 0;
    if (Date.now() > ttlExpiry) return null;

    return entry;
  } catch (err) {
    console.error(`[searchCache] read error ${username}`, err);
    return null;
  }
}

export function setSearchCache(
  username: string,
  data: Omit<SearchCacheDoc, 'fetchedAt' | 'ttlExpiry' | 'username'>,
  ttlMs: number = SEARCH_CACHE_TTL,
): void {
  const now = Date.now();
  const db = getFirebaseDb();

  setDoc(doc(db, 'searchCache', username.toLowerCase()), {
    username: username.toLowerCase(),
    ...data,
    fetchedAt: Timestamp.fromMillis(now),
    ttlExpiry: Timestamp.fromMillis(now + ttlMs),
  }).catch((err) => {
    console.error(`[searchCache] write error ${username}`, err);
  });
}

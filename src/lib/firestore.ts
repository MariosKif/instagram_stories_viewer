/**
 * Firestore data access layer.
 * Handles user profiles, search records, and usage limits.
 */
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';

/* ── Types ─────────────────────────────────────────── */

export interface UserProfile {
  email: string;
  createdAt: Timestamp;
  plan: 'free' | 'pro';
  searchesUsed: number;
  adRewardAppliedAt?: Timestamp | null;
}

export interface SearchRecord {
  uid: string;
  username: string;
  createdAt: Timestamp;
  reportData: Record<string, unknown>;
}

/* ── User helpers ──────────────────────────────────── */

/** Create or update a user profile document (called on first login) */
export async function ensureUserProfile(uid: string, email: string): Promise<void> {
  const db = getFirebaseDb();
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email,
      createdAt: serverTimestamp(),
      plan: 'free',
      searchesUsed: 0,
    } satisfies Omit<UserProfile, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> });
  }
}

/** Fetch the user profile */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

/* ── Search helpers ────────────────────────────────── */

const FREE_SEARCH_LIMIT = 2;
const WINDOW_MS = 8 * 60 * 60 * 1000;      // 8 hours
const AD_REWARD_MS = 3 * 60 * 60 * 1000;    // 3 hours

/** Get the effective window start, accounting for any ad reward. */
async function getEffectiveWindowStart(uid: string): Promise<Date> {
  const db = getFirebaseDb();
  const userSnap = await getDoc(doc(db, 'users', uid));
  let windowMs = WINDOW_MS;
  if (userSnap.exists()) {
    const data = userSnap.data() as UserProfile;
    if (data.adRewardAppliedAt) {
      const appliedAt = data.adRewardAppliedAt.toMillis();
      if (Date.now() - appliedAt < WINDOW_MS) {
        windowMs = WINDOW_MS - AD_REWARD_MS; // 5 hours
      }
    }
  }
  return new Date(Date.now() - windowMs);
}

/** Check whether a free user has remaining searches in the 8h window */
export async function canSearch(uid: string, plan: 'free' | 'pro'): Promise<boolean> {
  if (plan === 'pro') return true;

  const db = getFirebaseDb();
  const windowStart = await getEffectiveWindowStart(uid);

  const q = query(
    collection(db, 'searches'),
    where('uid', '==', uid),
    where('createdAt', '>=', Timestamp.fromDate(windowStart)),
  );
  const snap = await getDocs(q);
  return snap.size < FREE_SEARCH_LIMIT;
}

/** Returns ms until the next search slot opens for a logged-in user. */
export async function getTimeUntilResetFirestore(uid: string): Promise<number> {
  const db = getFirebaseDb();
  const windowStart = await getEffectiveWindowStart(uid);

  const q = query(
    collection(db, 'searches'),
    where('uid', '==', uid),
    where('createdAt', '>=', Timestamp.fromDate(windowStart)),
    orderBy('createdAt', 'asc'),
  );
  const snap = await getDocs(q);
  if (snap.size < FREE_SEARCH_LIMIT) return 0;

  const oldest = snap.docs[0].data().createdAt as Timestamp;
  const windowMs = Date.now() - windowStart.getTime(); // effective window length
  const expiresAt = oldest.toMillis() + windowMs;
  return Math.max(0, expiresAt - Date.now());
}

/** Count searches in the current 8h window (for dashboard display). */
export async function getSearchesInWindow(uid: string): Promise<number> {
  const db = getFirebaseDb();
  const windowStart = await getEffectiveWindowStart(uid);

  const q = query(
    collection(db, 'searches'),
    where('uid', '==', uid),
    where('createdAt', '>=', Timestamp.fromDate(windowStart)),
  );
  const snap = await getDocs(q);
  return snap.size;
}

/** Apply ad reward — sets adRewardAppliedAt on the user doc. Returns false if already used this window. */
export async function applyAdRewardFirestore(uid: string): Promise<boolean> {
  if (await hasUsedAdRewardFirestore(uid)) return false;
  const db = getFirebaseDb();
  await setDoc(doc(db, 'users', uid), { adRewardAppliedAt: serverTimestamp() }, { merge: true });
  return true;
}

/** Check if ad reward was applied within the current 8h window. */
export async function hasUsedAdRewardFirestore(uid: string): Promise<boolean> {
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return false;
  const data = snap.data() as UserProfile;
  if (!data.adRewardAppliedAt) return false;
  return Date.now() - data.adRewardAppliedAt.toMillis() < WINDOW_MS;
}

/** Save a search record */
export async function saveSearch(
  uid: string,
  username: string,
  reportData: Record<string, unknown>,
): Promise<string> {
  const db = getFirebaseDb();
  const ref = await addDoc(collection(db, 'searches'), {
    uid,
    username,
    createdAt: serverTimestamp(),
    reportData,
  });
  return ref.id;
}

/** Get recent searches for a user */
export async function getUserSearches(
  uid: string,
  maxResults = 20,
): Promise<(SearchRecord & { id: string })[]> {
  const db = getFirebaseDb();
  const q = query(
    collection(db, 'searches'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(maxResults),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as SearchRecord) }));
}

/** Generate a mock report for a username (placeholder for real data pipeline) */
export function generateMockReport(username: string): Record<string, unknown> {
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const followers = rand(1000, 500000);
  const following = rand(100, 5000);
  const posts = rand(50, 2000);

  return {
    username,
    profilePic: `https://ui-avatars.com/api/?name=${username}&background=0ea5e9&color=fff&size=200`,
    fullName: username.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    bio: 'Digital creator | Content enthusiast',
    isVerified: Math.random() > 0.7,
    followers,
    following,
    posts,
    engagementRate: (Math.random() * 5 + 0.5).toFixed(2),
    avgLikes: rand(100, followers * 0.05),
    avgComments: rand(5, followers * 0.005),
    recentActivity: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
      posts: rand(0, 3),
      stories: rand(0, 8),
      likes: rand(50, 500),
    })),
    topHashtags: ['#lifestyle', '#photography', '#travel', '#instagood', '#explore', '#daily'],
    followerGrowth: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10),
      count: followers - rand(0, 5000) + i * rand(10, 200),
    })),
    topInteractions: [
      { username: 'user_alpha', interactions: rand(20, 100) },
      { username: 'creative.studio', interactions: rand(15, 80) },
      { username: 'daily_vibes', interactions: rand(10, 60) },
      { username: 'photo.lens', interactions: rand(5, 40) },
      { username: 'trend_setter', interactions: rand(3, 30) },
    ],
    contentBreakdown: {
      photos: rand(40, 70),
      videos: rand(15, 35),
      reels: rand(10, 30),
      carousels: rand(5, 20),
    },
  };
}

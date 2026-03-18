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

/** Generate a real analytics report from API response data */
export function generateRealReport(
  profile: Record<string, any>,
  postsData: Record<string, any>,
): Record<string, unknown> {
  const username = profile?.username || '';
  const followers = profile?.followers_count ?? 0;
  const following = profile?.following_count ?? 0;

  // Normalize posts array
  let posts: any[] = [];
  if (Array.isArray(postsData)) posts = postsData;
  else if (Array.isArray(postsData?.items)) posts = postsData.items;
  else if (Array.isArray(postsData?.posts)) posts = postsData.posts;
  else if (Array.isArray(postsData?.edges)) posts = postsData.edges;
  else if (postsData?.data) return generateRealReport(profile, postsData.data);
  posts = posts.map((p) => p?.node || p).filter(Boolean);

  // Avg likes & comments
  const totalLikes = posts.reduce((sum, p) => sum + (p.like_count || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.comment_count || 0), 0);
  const avgLikes = posts.length > 0 ? Math.round(totalLikes / posts.length) : 0;
  const avgComments = posts.length > 0 ? Math.round(totalComments / posts.length) : 0;

  // Engagement rate
  const engagementRate = followers > 0
    ? ((avgLikes + avgComments) / followers * 100).toFixed(2)
    : '0.00';

  // Content breakdown
  let photos = 0, videos = 0, reels = 0, carousels = 0;
  for (const p of posts) {
    if (p.product_type === 'clips') { reels++; continue; }
    switch (p.media_type) {
      case 1: photos++; break;
      case 2: videos++; break;
      case 8: carousels++; break;
      default: photos++; break;
    }
  }

  // Top hashtags
  const hashtagCounts: Record<string, number> = {};
  for (const p of posts) {
    const text = p.caption?.text || '';
    const tags = text.match(/#[\w]+/g) || [];
    for (const tag of tags) {
      const lower = tag.toLowerCase();
      hashtagCounts[lower] = (hashtagCounts[lower] || 0) + 1;
    }
  }
  const topHashtags = Object.entries(hashtagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag]) => tag);

  // Recent activity (last 7 days)
  const now = Math.floor(Date.now() / 1000);
  const recentActivity = Array.from({ length: 7 }, (_, i) => {
    const dayStart = now - (i + 1) * 86400;
    const dayEnd = now - i * 86400;
    const dayPosts = posts.filter((p) => {
      const ts = p.taken_at || 0;
      return ts >= dayStart && ts < dayEnd;
    });
    return {
      date: new Date((dayEnd) * 1000).toISOString().slice(0, 10),
      posts: dayPosts.length,
      likes: dayPosts.reduce((s, p) => s + (p.like_count || 0), 0),
    };
  });

  // Posting frequency (last 30 days) — replaces follower growth
  const postingFrequency = Array.from({ length: 30 }, (_, i) => {
    const dayStart = now - (29 - i + 1) * 86400;
    const dayEnd = now - (29 - i) * 86400;
    const count = posts.filter((p) => {
      const ts = p.taken_at || 0;
      return ts >= dayStart && ts < dayEnd;
    }).length;
    return {
      date: new Date(dayEnd * 1000).toISOString().slice(0, 10),
      count,
    };
  });

  // Top posts (by engagement) — replaces top interactions
  const topPosts = [...posts]
    .sort((a, b) => ((b.like_count || 0) + (b.comment_count || 0)) - ((a.like_count || 0) + (a.comment_count || 0)))
    .slice(0, 5)
    .map((p) => {
      const imageVersions = p.image_versions2?.candidates || [];
      return {
        code: p.code || '',
        thumbnail: imageVersions.length > 0 ? imageVersions[0].url : '',
        likes: p.like_count || 0,
        comments: p.comment_count || 0,
        caption: (p.caption?.text || '').slice(0, 100),
      };
    });

  return {
    username,
    profilePic: profile?.profile_pic_url || `https://ui-avatars.com/api/?name=${username}&background=0ea5e9&color=fff&size=200`,
    fullName: profile?.full_name || username,
    bio: profile?.biography || '',
    isVerified: profile?.is_verified || false,
    followers,
    following,
    posts: posts.length,
    engagementRate,
    avgLikes,
    avgComments,
    recentActivity,
    topHashtags,
    postingFrequency,
    topPosts,
    contentBreakdown: { photos, videos, reels, carousels },
  };
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

/**
 * Client-side rate limiting for anonymous (non-logged-in) users.
 * Uses localStorage + a fallback cookie to persist a device ID and search timestamps.
 * No Firebase dependency — everything runs locally in the browser.
 */

/* ── Constants ────────────────────────────────────── */

export const WINDOW_MS = 8 * 60 * 60 * 1000;      // 8 hours
export const AD_REWARD_MS = 3 * 60 * 60 * 1000;    // 3 hours
export const FREE_SEARCH_LIMIT = 2;

const LS_DEVICE_ID = 'igsp_device_id';
const LS_SEARCHES = 'igsp_anon_searches';
const LS_AD_REWARD = 'igsp_anon_ad_reward';
const COOKIE_DEVICE_ID = 'igsp_device_id';

/* ── Device ID ────────────────────────────────────── */

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days: number): void {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/** Get or create a persistent device ID (localStorage + cookie fallback). */
export function getDeviceId(): string {
  let id = localStorage.getItem(LS_DEVICE_ID) || getCookie(COOKIE_DEVICE_ID);
  if (!id) {
    id = generateUUID();
  }
  // Always sync both storage locations
  localStorage.setItem(LS_DEVICE_ID, id);
  setCookie(COOKIE_DEVICE_ID, id, 365);
  return id;
}

/* ── Helpers ──────────────────────────────────────── */

function getSearchTimestamps(): number[] {
  try {
    const raw = localStorage.getItem(LS_SEARCHES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getAdReward(): { appliedAt: number } | null {
  try {
    const raw = localStorage.getItem(LS_AD_REWARD);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getEffectiveWindowMs(): number {
  const reward = getAdReward();
  if (reward && Date.now() - reward.appliedAt < WINDOW_MS) {
    return WINDOW_MS - AD_REWARD_MS; // 5 hours
  }
  return WINDOW_MS;
}

function getSearchesInWindow(): number[] {
  const windowMs = getEffectiveWindowMs();
  const cutoff = Date.now() - windowMs;
  return getSearchTimestamps().filter((ts) => ts > cutoff);
}

/* ── Exports ──────────────────────────────────────── */

/** Check whether an anonymous user can perform a search. */
export function canSearchAnonymous(): { allowed: boolean } {
  return { allowed: getSearchesInWindow().length < FREE_SEARCH_LIMIT };
}

/** Record a search timestamp for the anonymous user. */
export function recordAnonymousSearch(): void {
  const timestamps = getSearchTimestamps();
  timestamps.push(Date.now());
  // Keep only timestamps from the last full window to avoid unbounded growth
  const cutoff = Date.now() - WINDOW_MS;
  const pruned = timestamps.filter((ts) => ts > cutoff);
  localStorage.setItem(LS_SEARCHES, JSON.stringify(pruned));
}

/** Returns ms until the next search slot opens (oldest search in window expires). */
export function getTimeUntilReset(): number {
  const windowMs = getEffectiveWindowMs();
  const cutoff = Date.now() - windowMs;
  const inWindow = getSearchTimestamps().filter((ts) => ts > cutoff);
  if (inWindow.length < FREE_SEARCH_LIMIT) return 0;
  const oldest = Math.min(...inWindow);
  return Math.max(0, oldest + windowMs - Date.now());
}

/** Apply the ad reward (shrinks the effective window by 3h). Returns false if already used this window. */
export function applyAdReward(): boolean {
  if (hasUsedAdReward()) return false;
  localStorage.setItem(LS_AD_REWARD, JSON.stringify({ appliedAt: Date.now() }));
  return true;
}

/** True if an ad reward was applied within the current 8h window. */
export function hasUsedAdReward(): boolean {
  const reward = getAdReward();
  if (!reward) return false;
  return Date.now() - reward.appliedAt < WINDOW_MS;
}

/** Format milliseconds as "Xh Xm Xs". */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return '0s';
  const totalSeconds = Math.ceil(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  return parts.join(' ');
}

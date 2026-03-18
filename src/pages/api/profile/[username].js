import { makeScraperRequest } from '../../../lib/instagramScraper.js';
import { getCachedApiData, setCachedApiData, getSearchCache } from '../../../lib/apiCache.ts';

function parseFollowerCount(text) {
    if (!text || typeof text !== 'string') return null;
    const match = text.match(/([\d.,]+)\s*([KMB])?/i);
    if (!match) return null;

    let value = parseFloat(match[1].replace(/,/g, ''));
    if (Number.isNaN(value)) return null;

    const suffix = (match[2] || '').toUpperCase();
    switch (suffix) {
        case 'K': value *= 1_000; break;
        case 'M': value *= 1_000_000; break;
        case 'B': value *= 1_000_000_000; break;
        default: break;
    }
    return Math.round(value);
}

export async function GET({ params }) {
    try {
        const cleanUsername = params.username.replace(/^@/, '').replace(/\/$/, '');

        // Check searchCache first
        const searchCached = await getSearchCache(cleanUsername);
        if (searchCached?.profile) {
            return new Response(JSON.stringify({ success: true, data: searchCached.profile }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check per-type apiCache
        const cached = await getCachedApiData(cleanUsername, 'profile');
        if (cached) {
            return new Response(JSON.stringify({ success: true, data: cached }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Fetch from RapidAPI
        const data = await makeScraperRequest('search', { search_query: cleanUsername });
        const users = Array.isArray(data?.users) ? data.users : [];
        const lower = cleanUsername.toLowerCase();

        let match = users.find(item => item?.user?.username?.toLowerCase() === lower);
        if (!match && users.length > 0) match = users[0];

        const userData = match?.user;
        if (!userData) {
            return new Response(JSON.stringify({ success: false, error: 'Profile not found' }), {
                status: 404, headers: { 'Content-Type': 'application/json' }
            });
        }

        const followersText = userData.search_social_context || '';
        const profile = {
            username: userData.username,
            full_name: userData.full_name || userData.username,
            profile_pic_url: userData.profile_pic_url || userData.hd_profile_pic_url_info?.url || '',
            is_verified: Boolean(userData.is_verified),
            is_private: Boolean(userData.is_private),
            id: userData.pk || userData.id || null,
            followers_text: followersText,
            followers_count: parseFollowerCount(followersText),
            following_count: userData.following_count ?? null,
            biography: userData.biography || ''
        };

        setCachedApiData(cleanUsername, 'profile', profile);

        return new Response(JSON.stringify({ success: true, data: profile }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Profile endpoint error:', error);
        return new Response(JSON.stringify({
            success: false, error: error.message || 'Failed to fetch profile'
        }), { status: 502, headers: { 'Content-Type': 'application/json' } });
    }
}

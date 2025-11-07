import { makeScraperRequest } from '../../../lib/instagramScraper.js';

function parseFollowerCount(text) {
    if (!text || typeof text !== 'string') return null;
    const match = text.match(/([\d.,]+)\s*([KMB])?/i);
    if (!match) return null;

    let value = parseFloat(match[1].replace(/,/g, ''));
    if (Number.isNaN(value)) return null;

    const suffix = (match[2] || '').toUpperCase();
    switch (suffix) {
        case 'K':
            value *= 1_000;
            break;
        case 'M':
            value *= 1_000_000;
            break;
        case 'B':
            value *= 1_000_000_000;
            break;
        default:
            break;
    }

    return Math.round(value);
}

// Get posts for a username
async function getPosts(username, maxId = '') {
    try {
        console.log(`Fetching posts for: ${username}`);

        const params = { username_or_url: username };
        if (maxId) {
            params.max_id = maxId;
        }

        const data = await makeScraperRequest('posts', params);

        console.log(`Successfully fetched posts for: ${username}`);
        return data;
    } catch (error) {
        console.error(`Error fetching posts for ${username}:`, error);
        throw error;
    }
}

// Get profile information for a username
async function getProfile(username) {
    try {
        console.log(`Fetching profile for: ${username}`);
        
        const data = await makeScraperRequest('search', {
            search_query: username
        });

        const users = Array.isArray(data?.users) ? data.users : [];
        const lower = username.toLowerCase();

        let match = users.find(item => item?.user?.username?.toLowerCase() === lower);
        if (!match && users.length > 0) {
            match = users[0];
        }

        const userData = match?.user;
        if (!userData) {
            throw new Error('Profile not found');
        }

        const followersText = userData.search_social_context || '';
        const followersCount = parseFollowerCount(followersText);

        const profile = {
            username: userData.username,
            full_name: userData.full_name || userData.username,
            profile_pic_url: userData.profile_pic_url || userData.hd_profile_pic_url_info?.url || '',
            is_verified: Boolean(userData.is_verified),
            is_private: Boolean(userData.is_private),
            id: userData.pk || userData.id || null,
            followers_text: followersText,
            followers_count: followersCount,
            following_count: userData.following_count ?? null,
            biography: userData.biography || ''
        };

        console.log(`Successfully fetched profile for: ${username}`);
        return profile;
    } catch (error) {
        console.error(`Error fetching profile for ${username}:`, error);
        throw error;
    }
}

// Get stories for a username
async function getStories(username) {
    try {
        console.log(`Fetching stories for: ${username}`);

        const data = await makeScraperRequest('stories', {
            username_or_url: username
        });

        console.log(`Successfully fetched stories for: ${username}`);
        return data;
    } catch (error) {
        console.error(`Error fetching stories for ${username}:`, error);
        throw error;
    }
}

// Get highlights for a username
async function getHighlights(username) {
    try {
        console.log(`Fetching highlights for: ${username}`);

        const data = await makeScraperRequest('highlights', {
            username_or_url: username
        });

        console.log(`Successfully fetched highlights for: ${username}`);
        return data;
    } catch (error) {
        console.error(`Error fetching highlights for ${username}:`, error);
        throw error;
    }
}

// Cache system with 20-minute TTL (in-memory for serverless)
const cache = new Map();
const CACHE_TTL = 20 * 60 * 1000; // 20 minutes

export async function GET({ params }) {
    try {
        const { username } = params;
        const cleanUsername = username.replace(/^@/, '').replace(/\/$/, '');
        
        // Check cache first
        const cacheKey = `full:${cleanUsername}`;
        const cached = cache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            console.log(`✓ Serving cached data for: ${cleanUsername}`);
            return new Response(JSON.stringify(cached.data), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log(`Starting complete data fetch for: ${cleanUsername}`);

        // Fetch all data in parallel
        const [profileData, postsData, storiesData, highlightsData] = await Promise.allSettled([
            getProfile(cleanUsername),
            getPosts(cleanUsername),
            getStories(cleanUsername),
            getHighlights(cleanUsername)
        ]);

        // Combine results
        const profileSuccess = profileData.status === 'fulfilled' && profileData.value;
        const postsSuccess = postsData.status === 'fulfilled' && postsData.value;
        const storiesSuccess = storiesData.status === 'fulfilled' && storiesData.value && !storiesData.value.error && !storiesData.value.message;
        const highlightsSuccess = highlightsData.status === 'fulfilled' && highlightsData.value;

        const allSucceeded = profileSuccess && postsSuccess;

        const result = {
            success: allSucceeded,
            error: undefined,
            data: {
                username: cleanUsername,
                profile: profileSuccess ? profileData.value : null,
                posts: postsSuccess ? postsData.value : null,
                stories: storiesSuccess ? storiesData.value : null,
                highlights: highlightsSuccess ? highlightsData.value : null
            }
        };

        if (!profileSuccess) {
            result.error = profileData.status === 'rejected'
                ? profileData.reason?.message || 'Failed to fetch profile information'
                : 'Failed to fetch profile information';
        } else if (!postsSuccess) {
            result.error = postsData.status === 'rejected'
                ? postsData.reason?.message || 'Failed to fetch posts'
                : 'Failed to fetch posts';
        }

        // Log any failed requests
        if (profileData.status === 'rejected') {
            console.error('Profile fetch failed:', profileData.reason);
        }
        if (postsData.status === 'rejected') {
            console.error('Posts fetch failed:', postsData.reason);
        }
        if (storiesData.status === 'rejected') {
            console.error('Stories fetch failed:', storiesData.reason);
        }
        if (highlightsData.status === 'rejected') {
            console.error('Highlights fetch failed:', highlightsData.reason);
        }

        // Cache the result only if profile & posts succeeded
        if (allSucceeded) {
            cache.set(cacheKey, { data: result, timestamp: Date.now() });
            console.log(`✓ Cached data for: ${cleanUsername}`);
        }
        
        if (!allSucceeded) {
            return new Response(JSON.stringify(result), {
                status: 502,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Full data endpoint error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message || 'Failed to fetch complete data'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}


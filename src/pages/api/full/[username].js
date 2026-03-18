import { makeScraperRequest } from '../../../lib/instagramScraper.js';
import { getSearchCache, setSearchCache, getCachedApiData, setCachedApiData, POPULAR_CACHE_TTL } from '../../../lib/apiCache.ts';
import { generateRealReport } from '../../../lib/firestore.ts';
import { isPopularAccount } from '../../../data/popularAccounts.ts';

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

export async function GET({ params }) {
    try {
        const { username } = params;
        const cleanUsername = username.replace(/^@/, '').replace(/\/$/, '');

        // 1. Check searchCache first (full combined result, 6h TTL)
        const searchCached = await getSearchCache(cleanUsername);
        if (searchCached) {
            console.log(`✓ Serving searchCache hit for: ${cleanUsername}`);
            const result = {
                success: true,
                data: {
                    username: cleanUsername,
                    profile: searchCached.profile,
                    posts: searchCached.posts,
                    stories: searchCached.stories,
                    highlights: searchCached.highlights,
                },
                report: searchCached.report,
            };
            return new Response(JSON.stringify(result), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 2. Check per-data-type apiCache in parallel
        const [cachedProfile, cachedPosts, cachedStories, cachedHighlights] = await Promise.all([
            getCachedApiData(cleanUsername, 'profile'),
            getCachedApiData(cleanUsername, 'posts'),
            getCachedApiData(cleanUsername, 'stories'),
            getCachedApiData(cleanUsername, 'highlights'),
        ]);

        console.log(`apiCache hits for ${cleanUsername}: profile=${!!cachedProfile} posts=${!!cachedPosts} stories=${!!cachedStories} highlights=${!!cachedHighlights}`);

        // 3. Only call RapidAPI for cache misses
        const fetchPromises = [];
        const fetchKeys = [];

        if (!cachedProfile) { fetchPromises.push(getProfile(cleanUsername)); fetchKeys.push('profile'); }
        if (!cachedPosts) { fetchPromises.push(getPosts(cleanUsername)); fetchKeys.push('posts'); }
        if (!cachedStories) { fetchPromises.push(getStories(cleanUsername)); fetchKeys.push('stories'); }
        if (!cachedHighlights) { fetchPromises.push(getHighlights(cleanUsername)); fetchKeys.push('highlights'); }

        const fetchResults = await Promise.allSettled(fetchPromises);

        // Map fetch results back by key
        const freshData = {};
        fetchKeys.forEach((key, i) => {
            freshData[key] = fetchResults[i];
        });

        // Merge cached + fresh
        const profileResult = cachedProfile
            ? { status: 'fulfilled', value: cachedProfile }
            : (freshData.profile || { status: 'rejected', reason: new Error('Not fetched') });
        const postsResult = cachedPosts
            ? { status: 'fulfilled', value: cachedPosts }
            : (freshData.posts || { status: 'rejected', reason: new Error('Not fetched') });
        const storiesResult = cachedStories
            ? { status: 'fulfilled', value: cachedStories }
            : (freshData.stories || { status: 'rejected', reason: new Error('Not fetched') });
        const highlightsResult = cachedHighlights
            ? { status: 'fulfilled', value: cachedHighlights }
            : (freshData.highlights || { status: 'rejected', reason: new Error('Not fetched') });

        // Combine results
        const profileSuccess = profileResult.status === 'fulfilled' && profileResult.value;
        const postsSuccess = postsResult.status === 'fulfilled' && postsResult.value;
        const storiesSuccess = storiesResult.status === 'fulfilled' && storiesResult.value && !storiesResult.value.error && !storiesResult.value.message;
        const highlightsSuccess = highlightsResult.status === 'fulfilled' && highlightsResult.value;

        const allSucceeded = profileSuccess && postsSuccess;

        const profileVal = profileSuccess ? profileResult.value : null;
        const postsVal = postsSuccess ? postsResult.value : null;
        const storiesVal = storiesSuccess ? storiesResult.value : null;
        const highlightsVal = highlightsSuccess ? highlightsResult.value : null;

        const result = {
            success: allSucceeded,
            error: undefined,
            data: {
                username: cleanUsername,
                profile: profileVal,
                posts: postsVal,
                stories: storiesVal,
                highlights: highlightsVal,
            }
        };

        if (!profileSuccess) {
            result.error = profileResult.status === 'rejected'
                ? profileResult.reason?.message || 'Failed to fetch profile information'
                : 'Failed to fetch profile information';
        } else if (!postsSuccess) {
            result.error = postsResult.status === 'rejected'
                ? postsResult.reason?.message || 'Failed to fetch posts'
                : 'Failed to fetch posts';
        }

        // Log any failed requests
        if (profileResult.status === 'rejected') {
            console.error('Profile fetch failed:', profileResult.reason);
        }
        if (postsResult.status === 'rejected') {
            console.error('Posts fetch failed:', postsResult.reason);
        }
        if (storiesResult.status === 'rejected') {
            console.error('Stories fetch failed:', storiesResult.reason);
        }
        if (highlightsResult.status === 'rejected') {
            console.error('Highlights fetch failed:', highlightsResult.reason);
        }

        // 4. Write fresh results to Firestore caches (fire-and-forget)
        if (allSucceeded) {
            // Write per-data-type caches for any fresh fetches
            if (!cachedProfile && profileVal) setCachedApiData(cleanUsername, 'profile', profileVal);
            if (!cachedPosts && postsVal) setCachedApiData(cleanUsername, 'posts', postsVal);
            if (!cachedStories && storiesVal) setCachedApiData(cleanUsername, 'stories', storiesVal);
            if (!cachedHighlights && highlightsVal) setCachedApiData(cleanUsername, 'highlights', highlightsVal);

            // Compute real report and write to searchCache
            const report = generateRealReport(profileVal, postsVal);
            result.report = report;
            const cacheTtl = isPopularAccount(cleanUsername) ? POPULAR_CACHE_TTL : undefined;
            setSearchCache(cleanUsername, {
                profile: profileVal,
                posts: postsVal,
                stories: storiesVal,
                highlights: highlightsVal,
                report,
            }, cacheTtl);

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

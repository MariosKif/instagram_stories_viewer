// RapidAPI Instagram API configuration
const RAPIDAPI_CONFIG = {
    host: 'instagram120.p.rapidapi.com',
    key: process.env.RAPIDAPI_KEY || '663ef24eedmsha6824f05f5bee0bp1c071bjsnef3779a17b07', // Use env variable
    baseUrl: 'https://instagram120.p.rapidapi.com/api/instagram'
};

// Helper function to make RapidAPI requests
async function makeRapidAPIRequest(endpoint, data = {}) {
    try {
        const response = await fetch(`${RAPIDAPI_CONFIG.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-rapidapi-host': RAPIDAPI_CONFIG.host,
                'x-rapidapi-key': RAPIDAPI_CONFIG.key
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`RapidAPI request failed: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('RapidAPI request error:', error);
        throw error;
    }
}

// Get posts for a username
async function getPosts(username, maxId = '') {
    try {
        console.log(`Fetching posts for: ${username}`);
        
        const data = await makeRapidAPIRequest('/posts', {
            username: username,
            maxId: maxId
        });

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
        
        const data = await makeRapidAPIRequest('/profile', {
            username: username
        });

        console.log(`Successfully fetched profile for: ${username}`);
        return data;
    } catch (error) {
        console.error(`Error fetching profile for ${username}:`, error);
        throw error;
    }
}

// Get stories for a username
async function getStories(username) {
    try {
        console.log(`Fetching stories for: ${username}`);
        
        const data = await makeRapidAPIRequest('/stories', {
            username: username
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
        
        const data = await makeRapidAPIRequest('/highlights', {
            username: username
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
        const result = {
            success: true,
            data: {
                username: cleanUsername,
                profile: profileData.status === 'fulfilled' ? profileData.value : null,
                posts: postsData.status === 'fulfilled' ? postsData.value : null,
                stories: storiesData.status === 'fulfilled' ? storiesData.value : null,
                highlights: highlightsData.status === 'fulfilled' ? highlightsData.value : null
            }
        };

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

        // Cache the result
        cache.set(cacheKey, { data: result, timestamp: Date.now() });
        console.log(`✓ Cached data for: ${cleanUsername}`);
        
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

